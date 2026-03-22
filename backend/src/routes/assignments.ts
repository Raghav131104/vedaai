import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Assignment } from '../models/Assignment';
import { assessmentQueue } from '../workers/assessmentWorker';

const router = Router();

// Store files on disk so we can process them
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use PDF, TXT, JPG, or PNG.`));
    }
  },
});

/** Extract plain text from uploaded file */
async function extractFileContent(filePath: string, mimetype: string): Promise<string> {
  if (mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (mimetype === 'application/pdf') {
    try {
      // Try pdf-parse if available
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch {
      // Fallback: return a note that file was uploaded but couldn't be parsed
      console.warn('pdf-parse not available, storing file reference only');
      return `[PDF file uploaded: ${path.basename(filePath)}. Content extraction requires pdf-parse package.]`;
    }
  }

  if (mimetype.startsWith('image/')) {
    // For images, we store a reference — the worker will handle vision if needed
    return `[Image uploaded: ${path.basename(filePath)}. Please generate questions based on the assignment details and image context.]`;
  }

  return '';
}

// Create assignment and enqueue generation job
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, subject, grade, dueDate, questionConfigs, additionalInstructions } = req.body;

    if (!title || !subject || !grade || !dueDate || !questionConfigs) {
      return res.status(400).json({ error: 'Missing required fields: title, subject, grade, dueDate, questionConfigs' });
    }

    let parsedConfigs;
    try {
      parsedConfigs = typeof questionConfigs === 'string'
        ? JSON.parse(questionConfigs)
        : questionConfigs;
    } catch {
      return res.status(400).json({ error: 'Invalid questionConfigs format — must be valid JSON array' });
    }

    if (!Array.isArray(parsedConfigs) || parsedConfigs.length === 0) {
      return res.status(400).json({ error: 'At least one question section is required' });
    }

    for (const cfg of parsedConfigs) {
      if (!cfg.type || cfg.count === undefined || cfg.marks === undefined) {
        return res.status(400).json({ error: 'Each question config must have type, count, and marks' });
      }
      if (cfg.count < 1 || cfg.marks < 1) {
        return res.status(400).json({ error: 'Count and marks must be positive numbers' });
      }
    }

    const jobId = uuidv4();

    // Handle file upload — extract content so AI can actually use it
    let fileContent: string | undefined;
    let fileName: string | undefined;
    let filePath: string | undefined;

    if (req.file) {
      fileName = req.file.originalname;
      filePath = req.file.path;
      try {
        fileContent = await extractFileContent(req.file.path, req.file.mimetype);
        console.log(`Extracted ${fileContent?.length || 0} chars from ${fileName}`);
      } catch (err) {
        console.error('File extraction error:', err);
        fileContent = `[Uploaded file: ${fileName} — extraction failed]`;
      }
    }

    const assignment = await Assignment.create({
      title,
      subject,
      grade,
      dueDate: new Date(dueDate),
      questionConfigs: parsedConfigs,
      additionalInstructions,
      fileContent,
      fileName,
      status: 'pending',
      jobId,
    });

    // Enqueue the job
    await assessmentQueue.add(
      'generate',
      { assignmentId: assignment._id.toString(), jobId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    );

    // Clean up temp file after DB save (content is now stored)
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch {}
    }

    return res.status(201).json({
      message: 'Assignment created and generation queued',
      assignmentId: assignment._id.toString(),
      jobId,
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-fileContent')
      .limit(50);
    return res.json(assignments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select('-fileContent');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    return res.json(assignment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get assignment status
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select('status jobId assessmentId');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    return res.json({
      status: assignment.status,
      jobId: assignment.jobId,
      assessmentId: assignment.assessmentId,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    return res.json({ message: 'Assignment deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
