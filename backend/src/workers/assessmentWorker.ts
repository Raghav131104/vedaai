import { Worker, Queue } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import { getRedis } from '../services/redis';
import { sendJobUpdate } from '../services/websocket';
import { Assignment } from '../models/Assignment';
import { Assessment } from '../models/Assessment';
import { buildPrompt, parseAIResponse } from '../services/promptBuilder';

const redisConnection = getRedis();

export const assessmentQueue = new Queue('assessment-generation', {
  connection: redisConnection,
});

export function setupWorkers(): void {
  const worker = new Worker(
    'assessment-generation',
    async (job) => {
      const { assignmentId, jobId } = job.data;
      console.log(`Processing job ${jobId} for assignment ${assignmentId}`);

      sendJobUpdate(jobId, {
        type: 'job:started',
        jobId,
        message: 'AI is analysing your assignment...',
        progress: 10,
      });

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });

      sendJobUpdate(jobId, {
        type: 'job:progress',
        jobId,
        message: 'Building structured prompt...',
        progress: 25,
      });

      const prompt = buildPrompt({
        title: assignment.title,
        subject: assignment.subject,
        grade: assignment.grade,
        questionConfigs: assignment.questionConfigs,
        additionalInstructions: assignment.additionalInstructions,
        fileContent: assignment.fileContent,
        fileName: assignment.fileName,
      });

      sendJobUpdate(jobId, {
        type: 'job:progress',
        jobId,
        message: 'Generating questions with AI...',
        progress: 40,
      });

      const redis = getRedis();
      const cacheKey = `assessment:${assignmentId}`;
      const cached = await redis.get(cacheKey);

      let rawResponse: string;

      if (cached) {
        console.log('Cache hit for assessment');
        rawResponse = cached;
      } else {
        const client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
        });

        const textContent = message.content.find((c) => c.type === 'text');
        if (!textContent || textContent.type !== 'text')
          throw new Error('No text response from AI');

        rawResponse = textContent.text;
        await redis.setex(cacheKey, 86400 * 7, rawResponse);
      }

      sendJobUpdate(jobId, {
        type: 'job:progress',
        jobId,
        message: 'Parsing and structuring response...',
        progress: 75,
      });

      const { sections, totalMarks, duration } =
        parseAIResponse(rawResponse);

      sendJobUpdate(jobId, {
        type: 'job:progress',
        jobId,
        message: 'Saving to database...',
        progress: 90,
      });

      const assessment = await Assessment.create({
        assignmentId,
        title: `${assignment.title} — Question Paper`,
        subject: assignment.subject,
        grade: assignment.grade,
        totalMarks,
        duration,
        sections,
      });

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        assessmentId: assessment._id,
      });

      sendJobUpdate(jobId, {
        type: 'job:completed',
        jobId,
        message: 'Question paper generated successfully!',
        progress: 100,
        assessmentId: assessment._id.toString(),
      });

      console.log(
        `Job ${jobId} completed. Assessment: ${assessment._id}`
      );

      return { assessmentId: assessment._id.toString() };
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on('failed', async (job, err) => {
    if (job) {
      const { assignmentId, jobId } = job.data;
      console.error(`Job ${jobId} failed:`, err.message);

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
      });

      sendJobUpdate(jobId, {
        type: 'job:failed',
        jobId,
        message: err.message || 'Generation failed',
        progress: 0,
      });
    }
  });

  console.log('BullMQ workers initialised');
}