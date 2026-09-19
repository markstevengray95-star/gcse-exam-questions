export type IndicativeGrade = '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '1' | 'U';

export const PRACTICE_GRADE_BOUNDARIES: ReadonlyArray<{ grade: IndicativeGrade; minPercent: number }> = [
  { grade: '9', minPercent: 80 },
  { grade: '8', minPercent: 73 },
  { grade: '7', minPercent: 66 },
  { grade: '6', minPercent: 58 },
  { grade: '5', minPercent: 50 },
  { grade: '4', minPercent: 42 },
  { grade: '3', minPercent: 34 },
  { grade: '2', minPercent: 26 },
  { grade: '1', minPercent: 18 },
  { grade: 'U', minPercent: 0 },
];

export const PRACTICE_GRADE_NOTICE =
  'Practice bands are revision indicators only, not official predicted grades. AQA grade boundaries vary by exam series, paper, tier and qualification.';

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
