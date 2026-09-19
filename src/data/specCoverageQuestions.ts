import type { Question } from './questions';
import { specificationPoints } from './specification';

export type SpecCoverageQuestion = Question & { specificationPointId: string };

export const specCoverageQuestions: SpecCoverageQuestion[] = specificationPoints.map(point => ({
  id: `coverage-${point.id}`,
  specificationPointId: point.id,
  year: point.year,
  unit: point.unit,
  topic: point.topic,
  subTopic: point.label,
  subject: point.subject,
  paper: point.paper,
  course: point.course,
  tier: point.tier,
  commandWord: point.id.includes('practicals') || point.id === 'working-scientifically' ? 'Evaluate' : 'Explain',
  commandWordDefinition: point.id.includes('practicals') || point.id === 'working-scientifically'
    ? 'Use scientific evidence to identify strengths, limitations and justified improvements.'
    : 'Set out scientific reasons or mechanisms using clear linked statements.',
  questionType: point.id.includes('practicals') || point.id === 'working-scientifically' ? 'Data analysis' : 'Extended 6-mark level-of-response',
  prompt: point.prompt,
  maxMarks: 6,
  difficulty: point.course === 'Separate only' || point.tier === 'Higher only' ? 'Hard' : 'Medium',
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
  throw new Error(`AQA GCSE Science question coverage is incomplete: ${audit.uncovered.map(point => point.specCode).join(', ')}`);
}
