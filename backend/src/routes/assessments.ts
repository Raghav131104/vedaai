import { Router, Request, Response } from 'express';
import { Assessment } from '../models/Assessment';
import { Assignment } from '../models/Assignment';
import { assessmentQueue } from '../workers/assessmentWorker';
import { v4 as uuidv4 } from 'uuid';
import { getRedis } from '../services/redis';

const router = Router();

// Get assessment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('assignmentId');
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json(assessment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get assessment by assignment ID
router.get('/by-assignment/:assignmentId', async (req: Request, res: Response) => {
  try {
    const assessment = await Assessment.findOne({ assignmentId: req.params.assignmentId });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json(assessment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Regenerate assessment
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const assignment = await Assignment.findById(assessment.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Clear cache
    const redis = getRedis();
    await redis.del(`assessment:${assignment._id}`);

    const jobId = uuidv4();
    await Assignment.findByIdAndUpdate(assignment._id, { status: 'pending', jobId });

    await assessmentQueue.add(
      'generate',
      { assignmentId: assignment._id.toString(), jobId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );

    return res.json({
      message: 'Regeneration started',
      jobId,
      assignmentId: assignment._id.toString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
