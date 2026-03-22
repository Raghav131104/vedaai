import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AssignmentFormData, Assignment, Assessment,
  JobUpdate, QuestionConfig, SchoolSettings,
} from '@/types';

interface JobState {
  jobId: string | null;
  progress: number;
  message: string;
  status: 'idle' | 'connecting' | 'processing' | 'completed' | 'failed';
  assessmentId: string | null;
}

interface AssignmentStore {
  formData: AssignmentFormData;
  formErrors: Partial<Record<keyof AssignmentFormData | 'questionConfigs_global', string>>;
  isSubmitting: boolean;
  submittedAssignmentId: string | null;
  job: JobState;
  wsConnected: boolean;
  assignments: Assignment[];
  currentAssessment: Assessment | null;
  schoolSettings: SchoolSettings;
  settingsLoaded: boolean;

  // Form actions
  setField: <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => void;
  addQuestionConfig: () => void;
  removeQuestionConfig: (index: number) => void;
  updateQuestionConfig: (index: number, config: Partial<QuestionConfig>) => void;
  resetForm: () => void;
  validateForm: () => boolean;

  // Async actions
  submitAssignment: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchAssessment: (id: string) => Promise<void>;
  regenerateAssessment: (assessmentId: string) => Promise<{ jobId: string; assignmentId: string }>;

  // School settings actions
  fetchSchoolSettings: () => Promise<void>;
  saveSchoolSettings: (settings: SchoolSettings) => Promise<void>;

  // Job actions
  handleJobUpdate: (update: JobUpdate) => void;
  setWsConnected: (connected: boolean) => void;
}

const defaultFormData: AssignmentFormData = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  questionConfigs: [{ type: 'mcq', count: 5, marks: 2 }],
  additionalInstructions: '',
  file: null,
};

const defaultSchoolSettings: SchoolSettings = {
  schoolName: 'Delhi Public School',
  schoolLocation: 'Bokaro Steel City',
  boardAffiliation: 'CBSE',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    persist(
      (set, get) => ({
        formData: { ...defaultFormData },
        formErrors: {},
        isSubmitting: false,
        submittedAssignmentId: null,
        job: { jobId: null, progress: 0, message: '', status: 'idle', assessmentId: null },
        wsConnected: false,
        assignments: [],
        currentAssessment: null,
        schoolSettings: { ...defaultSchoolSettings },
        settingsLoaded: false,

        setField: (key, value) =>
          set((state) => ({
            formData: { ...state.formData, [key]: value },
            formErrors: { ...state.formErrors, [key]: undefined },
          })),

        addQuestionConfig: () =>
          set((state) => ({
            formData: {
              ...state.formData,
              questionConfigs: [...state.formData.questionConfigs, { type: 'short', count: 3, marks: 5 }],
            },
          })),

        removeQuestionConfig: (index) =>
          set((state) => ({
            formData: {
              ...state.formData,
              questionConfigs: state.formData.questionConfigs.filter((_, i) => i !== index),
            },
          })),

        updateQuestionConfig: (index, config) =>
          set((state) => ({
            formData: {
              ...state.formData,
              questionConfigs: state.formData.questionConfigs.map((c, i) =>
                i === index ? { ...c, ...config } : c
              ),
            },
            formErrors: { ...state.formErrors, questionConfigs_global: undefined },
          })),

        resetForm: () =>
          set({
            formData: { ...defaultFormData, questionConfigs: [{ type: 'mcq', count: 5, marks: 2 }] },
            formErrors: {},
            isSubmitting: false,
            submittedAssignmentId: null,
            job: { jobId: null, progress: 0, message: '', status: 'idle', assessmentId: null },
          }),

        validateForm: () => {
          const { formData } = get();
          const errs: Record<string, string> = {};

          if (!formData.title.trim()) errs.title = 'Assignment title is required';
          if (!formData.subject.trim()) errs.subject = 'Subject is required';
          if (!formData.grade.trim()) errs.grade = 'Grade/Class is required';
          if (!formData.dueDate) errs.dueDate = 'Due date is required';
          else if (new Date(formData.dueDate) < new Date()) errs.dueDate = 'Due date must be in the future';

          if (formData.questionConfigs.length === 0) {
            errs.questionConfigs_global = 'Add at least one question section';
          } else {
            for (const cfg of formData.questionConfigs) {
              if (cfg.count < 1) { errs.questionConfigs_global = 'Question count must be at least 1'; break; }
              if (cfg.marks < 1) { errs.questionConfigs_global = 'Marks must be at least 1'; break; }
            }
          }

          set({ formErrors: errs });
          return Object.keys(errs).length === 0;
        },

        submitAssignment: async () => {
          const { formData, validateForm } = get();
          if (!validateForm()) return;

          set({ isSubmitting: true });

          const fd = new FormData();
          fd.append('title', formData.title);
          fd.append('subject', formData.subject);
          fd.append('grade', formData.grade);
          fd.append('dueDate', formData.dueDate);
          fd.append('questionConfigs', JSON.stringify(formData.questionConfigs));
          fd.append('additionalInstructions', formData.additionalInstructions);
          if (formData.file) fd.append('file', formData.file);

          const res = await fetch(`${API_URL}/api/assignments`, { method: 'POST', body: fd });
          if (!res.ok) {
            const err = await res.json();
            set({ isSubmitting: false });
            throw new Error(err.error || 'Failed to create assignment');
          }
          const data = await res.json();

          set({
            isSubmitting: false,
            submittedAssignmentId: data.assignmentId,
            job: {
              jobId: data.jobId,
              progress: 0,
              message: 'Connecting to server...',
              status: 'connecting',
              assessmentId: null,
            },
          });
        },

        fetchAssignments: async () => {
          try {
            const res = await fetch(`${API_URL}/api/assignments`);
            if (res.ok) set({ assignments: await res.json() });
          } catch (e) {
            console.error('fetchAssignments error:', e);
          }
        },

        fetchAssessment: async (id: string) => {
          try {
            const res = await fetch(`${API_URL}/api/assessments/${id}`);
            if (res.ok) set({ currentAssessment: await res.json() });
          } catch (e) {
            console.error('fetchAssessment error:', e);
          }
        },

        regenerateAssessment: async (assessmentId: string) => {
          const res = await fetch(`${API_URL}/api/assessments/${assessmentId}/regenerate`, { method: 'POST' });
          if (!res.ok) throw new Error('Failed to regenerate');
          const data = await res.json();
          set({
            job: {
              jobId: data.jobId, progress: 0, message: 'Starting regeneration...',
              status: 'connecting', assessmentId: null,
            },
          });
          return { jobId: data.jobId, assignmentId: data.assignmentId };
        },

        fetchSchoolSettings: async () => {
          try {
            const res = await fetch(`${API_URL}/api/settings`);
            if (res.ok) {
              const data = await res.json();
              set({ schoolSettings: data, settingsLoaded: true });
            }
          } catch (e) {
            console.error('fetchSchoolSettings error:', e);
            set({ settingsLoaded: true });
          }
        },

        saveSchoolSettings: async (settings: SchoolSettings) => {
          const res = await fetch(`${API_URL}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to save settings');
          }
          const data = await res.json();
          set({ schoolSettings: data });
        },

        handleJobUpdate: (update: JobUpdate) =>
          set((state) => ({
            job: {
              ...state.job,
              jobId: update.jobId,
              message: update.message || state.job.message,
              progress: update.progress ?? state.job.progress,
              status:
                update.type === 'job:completed' ? 'completed' :
                update.type === 'job:failed' ? 'failed' : 'processing',
              assessmentId: update.assessmentId || state.job.assessmentId,
            },
          })),

        setWsConnected: (connected) => set({ wsConnected: connected }),
      }),
      {
        name: 'vedaai-school-settings',
        partialize: (state) => ({ schoolSettings: state.schoolSettings }),
      }
    ),
    { name: 'vedaai-store' }
  )
);
