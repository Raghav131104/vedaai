import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionConfig {
  type: 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionConfigs: IQuestionConfig[];
  additionalInstructions?: string;
  fileContent?: string;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  assessmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionConfigSchema = new Schema<IQuestionConfig>({
  type: { type: String, enum: ['mcq', 'short', 'long', 'truefalse', 'fillblank'], required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionConfigs: [QuestionConfigSchema],
    additionalInstructions: String,
    fileContent: String,
    fileName: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: String,
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
