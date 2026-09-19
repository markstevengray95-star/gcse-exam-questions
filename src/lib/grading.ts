export type IndicativeGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

export const PRACTICE_GRADE_BOUNDARIES: ReadonlyArray<{ grade: IndicativeGrade; minPercent: number }> = [
  { grade: 'A*', minPercent: 80 },
  { grade: 'A', minPercent: 70 },
  { grade: 'B', minPercent: 60 },
  { grade: 'C', minPercent: 50 },
  { grade: 'D', minPercent: 40 },
  { grade: 'E', minPercent: 30 },
  { grade: 'U', minPercent: 0 },
];

export const PRACTICE_GRADE_NOTICE =
  'Practice bands are revision indicators only. Official AQA grade boundaries vary by exam series and paper.';

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getIndicativeGrade(percent: number) {
  const safePercent = clampPercent(percent);
  const index = PRACTICE_GRADE_BOUNDARIES.findIndex(boundary => safePercent >= boundary.minPercent);
  const currentIndex = index === -1 ? PRACTICE_GRADE_BOUNDARIES.length - 1 : index;
  const current = PRACTICE_GRADE_BOUNDARIES[currentIndex];
  const next = currentIndex > 0 ? PRACTICE_GRADE_BOUNDARIES[currentIndex - 1] : null;

  return {
    percent: safePercent,
    grade: current.grade,
    minPercent: current.minPercent,
    nextGrade: next?.grade ?? null,
    nextMinPercent: next?.minPercent ?? null,
    percentagePointsToNext: next ? Math.max(0, next.minPercent - safePercent) : 0,
  };
}

export function getMarksNeededForNextBand(marksAwarded: number, totalMarks: number) {
  const safeTotal = Math.max(0, Math.trunc(totalMarks || 0));
  if (!safeTotal) return null;

  const safeMarks = Math.max(0, Math.min(safeTotal, Math.trunc(marksAwarded || 0)));
  const grade = getIndicativeGrade((safeMarks / safeTotal) * 100);
  if (grade.nextMinPercent == null) return null;

  const targetMarks = Math.ceil((grade.nextMinPercent / 100) * safeTotal);
  return {
    nextGrade: grade.nextGrade,
    targetMarks,
    marksNeeded: Math.max(0, targetMarks - safeMarks),
  };
}
