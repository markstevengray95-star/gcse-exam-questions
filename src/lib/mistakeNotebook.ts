import type { Question } from '@/data/questions';

export const MISTAKE_NOTEBOOK_KEY = 'aqaGcseScienceMistakeNotebook';
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;

export type MistakeEntry = {
  id: string;
  questionId: string;
  questionPrompt: string;
  topic: string;
  subTopic: string;
  createdAt: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewStage: number;
  reviewCount: number;
  mastered: boolean;
  marksAwarded: number;
  totalMarks: number;
  lostMarkNumber: number;
  reason: string;
  improvement: string;
  correction: string;
  misconceptions: string[];
  studentAnswerPreview: string;
};

type MarkingResult = {
  marksAwarded: number;
  totalMarks: number;
  lostMarksAnalysis?: { reason: string; improvementSuggestion: string }[];
  misconceptions?: string[];
  modelAnswer?: string;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function loadMistakeNotebook(): MistakeEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(MISTAKE_NOTEBOOK_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MistakeEntry => {
      if (!item || typeof item !== 'object') return false;
      const entry = item as Partial<MistakeEntry>;
      return typeof entry.id === 'string' && typeof entry.questionId === 'string' && typeof entry.questionPrompt === 'string';
    });
  } catch {
    return [];
  }
}

export function saveMistakeNotebook(entries: MistakeEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MISTAKE_NOTEBOOK_KEY, JSON.stringify(entries.slice(-500)));
    window.dispatchEvent(new CustomEvent('aqaGcseScienceMistakesUpdated'));
  } catch {
    // The app still works if browser storage is unavailable.
  }
}

export function recordMistakesFromResult(question: Question, result: MarkingResult, studentAnswerPreview: string) {
  if (typeof window === 'undefined') return [];
  const missingMarks = Math.max(0, Math.round(Number(result.totalMarks) - Number(result.marksAwarded)));
  if (!missingMarks) return [];

  const now = new Date();
  const details = Array.isArray(result.lostMarksAnalysis) ? result.lostMarksAnalysis : [];
  const misconceptions = Array.isArray(result.misconceptions) ? result.misconceptions.filter(Boolean).slice(0, 8) : [];
  const modelAnswer = String(result.modelAnswer || question.modelAnswer || '').trim();
  const existing = loadMistakeNotebook();

  const created = Array.from({ length: missingMarks }, (_, index): MistakeEntry => {
    const detail = details[index] || details[details.length - 1];
    const reason = detail?.reason?.trim() || `Mark ${index + 1} was not secured on this response.`;
    const improvement = detail?.improvementSuggestion?.trim() || 'Compare your response with the full-mark answer and identify the missing science statement, calculation step or unit.';
    return {
      id: `${question.id}-${Date.now()}-${index}`,
      questionId: question.id,
      questionPrompt: question.prompt,
      topic: question.topic,
      subTopic: question.subTopic,
      createdAt: now.toISOString(),
      nextReviewAt: addDays(now, REVIEW_INTERVAL_DAYS[0]),
      reviewStage: 0,
      reviewCount: 0,
      mastered: false,
      marksAwarded: result.marksAwarded,
      totalMarks: result.totalMarks,
      lostMarkNumber: index + 1,
      reason,
      improvement,
      correction: modelAnswer || improvement,
      misconceptions,
      studentAnswerPreview: studentAnswerPreview.slice(0, 1200),
    };
  });

  saveMistakeNotebook([...existing, ...created]);
  return created;
}

export function markMistakeReviewed(entry: MistakeEntry, confident: boolean): MistakeEntry {
  const now = new Date();
  if (!confident) {
    return {
      ...entry,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: addDays(now, 1),
      reviewCount: entry.reviewCount + 1,
      mastered: false,
    };
  }

  const nextStage = entry.reviewStage + 1;
  const completed = nextStage >= REVIEW_INTERVAL_DAYS.length;
  return {
    ...entry,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: completed ? undefined : addDays(now, REVIEW_INTERVAL_DAYS[nextStage]),
    reviewStage: Math.min(nextStage, REVIEW_INTERVAL_DAYS.length),
    reviewCount: entry.reviewCount + 1,
    mastered: completed,
  };
}
