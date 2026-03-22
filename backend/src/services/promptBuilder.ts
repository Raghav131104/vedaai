import { IQuestionConfig } from '../models/Assignment';
import { ISection, IQuestion } from '../models/Assessment';
import { v4 as uuidv4 } from 'uuid';

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  questionConfigs: IQuestionConfig[];
  additionalInstructions?: string;
  fileContent?: string;
  fileName?: string;
}

const TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice Questions (MCQ)',
  short: 'Short Answer Questions',
  long: 'Long Answer / Essay Questions',
  truefalse: 'True or False Questions',
  fillblank: 'Fill in the Blank Questions',
};

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function buildPrompt(input: AssignmentInput): string {
  const sections = input.questionConfigs.map((cfg, i) => {
    const label = SECTION_LETTERS[i] || `${i + 1}`;
    return `  Section ${label}: ${cfg.count} ${TYPE_LABELS[cfg.type] || cfg.type}, ${cfg.marks} mark(s) each`;
  });

  const totalMarks = input.questionConfigs.reduce((sum, c) => sum + c.count * c.marks, 0);

  // Build file content block — this is the critical fix
  let fileBlock = '';
  if (input.fileContent && input.fileContent.trim().length > 0) {
    const truncated = input.fileContent.trim().slice(0, 4000);
    fileBlock = `
## UPLOADED REFERENCE MATERIAL
The teacher has uploaded the following document (${input.fileName || 'file'}).
You MUST base ALL questions directly on the content below. Every question must
reference topics, concepts, terms, or examples found in this material.
Do NOT invent generic questions unrelated to this text.

--- BEGIN UPLOADED CONTENT ---
${truncated}
--- END UPLOADED CONTENT ---

`;
  }

  const instrBlock = input.additionalInstructions?.trim()
    ? `\n## TEACHER INSTRUCTIONS\n${input.additionalInstructions.trim()}\n`
    : '';

  return `You are an expert academic assessment creator for Indian schools.

## ASSIGNMENT DETAILS
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Total Marks: ${totalMarks}

## SECTIONS REQUIRED
${sections.join('\n')}
${fileBlock}${instrBlock}
## OUTPUT REQUIREMENTS
Return ONLY valid JSON — no markdown fences, no explanation text, nothing else.

Schema:
{
  "title": "string — descriptive paper title",
  "totalMarks": number,
  "duration": number (minutes),
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "totalMarks": number,
      "questions": [
        {
          "id": "q1",
          "text": "Full question text here",
          "type": "mcq|short|long|truefalse|fillblank",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."]  // only for MCQ
        }
      ]
    }
  ]
}

RULES:
1. ${input.fileContent ? 'CRITICAL: All questions MUST be based on the uploaded content above. Reference specific facts, definitions, and topics from it.' : `Questions must be relevant to ${input.subject} for ${input.grade}.`}
2. Difficulty mix: ~40% easy, ~40% medium, ~20% hard
3. MCQ options must be plausible and educational (4 options always)
4. Each section instruction should match its type (e.g. "Attempt all", "Answer any three")
5. Questions must be clear, unambiguous, and at the appropriate academic level
6. Return ONLY the JSON object`;
}

const SECTION_LETTERS_P = ['A', 'B', 'C', 'D', 'E', 'F'];

export function parseAIResponse(raw: string): {
  sections: ISection[];
  totalMarks: number;
  duration?: number;
  title: string;
} {
  const cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found in AI response');
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid response structure: missing sections array');
  }

  const sections: ISection[] = parsed.sections.map((sec: any, i: number) => {
    const sectionLetter = SECTION_LETTERS_P[i] || `${i + 1}`;
    const questions: IQuestion[] = (sec.questions || []).map((q: any) => ({
      id: q.id || uuidv4(),
      text: q.text || 'Question text missing',
      type: q.type || 'short',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      marks: typeof q.marks === 'number' ? q.marks : 1,
      options: q.options && Array.isArray(q.options) ? q.options : undefined,
    }));

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return {
      id: sec.id || `section-${sectionLetter.toLowerCase()}`,
      title: sec.title || `Section ${sectionLetter}`,
      instruction: sec.instruction || 'Attempt all questions',
      totalMarks: sec.totalMarks || totalMarks,
      questions,
    };
  });

  return {
    sections,
    totalMarks: parsed.totalMarks || sections.reduce((s, sec) => s + sec.totalMarks, 0),
    duration: parsed.duration,
    title: parsed.title || 'Question Paper',
  };
}
