export type QuestionType = 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions: string;
  file?: File | null;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions?: string;
  fileName?: string;
  status: AssignmentStatus;
  jobId?: string;
  assessmentId?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

export interface Assessment {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration?: number;
  sections: Section[];
  createdAt: string;
}

export interface JobUpdate {
  type: 'connected' | 'job:started' | 'job:progress' | 'job:completed' | 'job:failed';
  jobId: string;
  message?: string;
  progress?: number;
  assessmentId?: string;
}

export interface SchoolSettings {
  _id?: string;
  schoolName: string;
  schoolLocation: string;
  principalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  boardAffiliation?: string;
}
