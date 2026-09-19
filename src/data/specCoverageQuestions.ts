import type { PracticeQuestion } from './practiceQuestions';
import { specificationPoints } from './specification';

export type SpecCoverageQuestion = PracticeQuestion & { specificationPointId: string };

export const specCoverageQuestions: SpecCoverageQuestion[] = specificationPoints.map(point => ({
  id: `coverage-${point.id}`,
  specificationPointId: point.id,
  year: point.year,
  unit: point.unit,
  topic: point.topic,
  subTopic: point.label,
  commandWord: 'Explain',
  commandWordDefinition: 'Set out the relevant physics using clear linked statements.',
  questionType: 'Extended 6-mark level-of-response',
  prompt: point.prompt,
  maxMarks: 6,
  difficulty: point.option ? 'Hard' : 'Medium',
  hint: point.hint,
  template: '',
  requiredKeywords: point.match.slice(0, 10),
  markScheme: point.answerPoints.map(answerPoint => `[B1] ${answerPoint}`),
  modelAnswer: point.answerPoints.join(' '),
}));

export function specificationCoverageAudit() {
  const covered = new Set(specCoverageQuestions.map(question => question.specificationPointId));
  const uncovered = specificationPoints.filter(point => !covered.has(point.id));
  return {
    totalAreas: specificationPoints.length,
    coveredAreas: specificationPoints.length - uncovered.length,
    uncovered,
  };
}

const audit = specificationCoverageAudit();
if (audit.uncovered.length) {
  throw new Error(`AQA question coverage is incomplete: ${audit.uncovered.map(point => point.specCode).join(', ')}`);
}
