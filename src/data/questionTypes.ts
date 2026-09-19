import type { GcseCourse, GcseSubject, GcseTier } from './specification';

export interface Question {
  id: string;
  year: 'Year 10' | 'Year 11';
  unit: string;
  topic: string;
  subTopic: string;
  subject: GcseSubject;
  paper: 'Paper 1' | 'Paper 2' | 'Across papers';
  course: GcseCourse;
  tier: GcseTier;
  commandWord: string;
  commandWordDefinition: string;
  questionType: 'Short calculation' | 'Extended 6-mark level-of-response' | 'Data analysis' | 'Short explanation';
  prompt: string;
  maxMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  template: string;
  requiredKeywords: string[];
  markScheme: string[];
  modelAnswer: string;
  pag?: string;
  specificationPointId?: string;
  bankSource?: 'Biology question bank' | 'Chemistry question bank' | 'Physics question bank';
  bankReference?: string;
  sourcePartialMark?: { awarded: number; total: number };
}
