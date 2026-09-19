import { additionalPracticeQuestions } from './practiceQuestions';
import { generatedPracticeQuestions } from './generatedQuestions';
import { specCoverageQuestions, specificationCoverageAudit } from './specCoverageQuestions';
import { electricityPracticeQuestions } from './electricityQuestions';

export interface Question {
  id: string;
  year: 'Year 12' | 'Year 13';
  unit: string;
  topic: string;
  subTopic: string;
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
}

const correctedPracticeQuestions: Question[] = additionalPracticeQuestions.map(question => {
  if (question.id === 'practice-32') {
    return {
      ...question,
      questionType: 'Short calculation',
      markScheme: question.markScheme.map(point => point.includes('KE lost = 3.8 J') ? '[A1] KE lost = 3.0 J.' : point),
    } as Question;
  }

  if (['practice-31', 'practice-35', 'practice-38', 'practice-40'].includes(question.id)) {
    return { ...question, questionType: 'Short calculation' } as Question;
  }

  if (['practice-34', 'practice-37'].includes(question.id)) {
    return { ...question, questionType: 'Short explanation' } as Question;
  }

  if (question.id === 'practice-27') {
    return { ...question, commandWordDefinition: 'Fill in the missing part using the correct physics notation.' } as Question;
  }

  return question as Question;
});

const baseQuestions: Question[] = [
  {
    id: 'aqa-p1-1',
    year: 'Year 12',
    unit: '2. Particles',
    topic: 'Particles',
    subTopic: 'Photoelectric Effect',
    commandWord: 'Explain',
    commandWordDefinition: 'Set out purposes or reasons.',
    questionType: 'Short explanation',
    prompt: 'Explain what is meant by the work function of a metal.',
    maxMarks: 2,
    difficulty: 'Easy',
    hint: 'Minimum energy to escape.',
    template: '',
    requiredKeywords: ['minimum energy', 'escape', 'surface'],
    markScheme: ['[B1] Minimum energy required by an electron.', '[B1] To escape the metal surface.'],
    modelAnswer: 'The work function is the minimum energy required by an electron to escape the surface of the metal.',
  },
  {
    id: 'aqa-m1-1',
    year: 'Year 12',
    unit: '4. Mechanics',
    topic: 'Materials',
    subTopic: 'Young Modulus',
    commandWord: 'State',
    commandWordDefinition: 'Express in clear terms.',
    questionType: 'Short explanation',
    prompt: 'State Hooke’s law.',
    maxMarks: 2,
    difficulty: 'Easy',
    hint: 'Force and extension.',
    template: '',
    requiredKeywords: ['force', 'extension', 'proportional', 'limit of proportionality'],
    markScheme: ['[B1] Force is directly proportional to extension.', '[B1] Up to the limit of proportionality.'],
    modelAnswer: 'Force is directly proportional to extension provided the limit of proportionality is not exceeded.',
  },
  {
    id: 'aqa-w1-1',
    year: 'Year 12',
    unit: '3. Waves',
    topic: 'Interference',
    subTopic: 'Path Difference',
    commandWord: 'Explain',
    commandWordDefinition: 'Set out purposes or reasons.',
    questionType: 'Short explanation',
    prompt: 'Explain what is meant by coherent sources.',
    maxMarks: 2,
    difficulty: 'Medium',
    hint: 'Think phase and frequency.',
    template: '',
    requiredKeywords: ['constant phase difference', 'same frequency'],
    markScheme: ['[B1] Constant phase difference.', '[B1] Same frequency.'],
    modelAnswer: 'Coherent sources emit waves with the same frequency and a constant phase difference.',
  },
  {
    id: 'aqa-e1-1',
    year: 'Year 12',
    unit: '5. Electricity',
    topic: 'Circuits',
    subTopic: 'Internal Resistance',
    commandWord: 'Calculate',
    commandWordDefinition: 'Use mathematics to solve a problem.',
    questionType: 'Short calculation',
    prompt: 'A 9.0 V battery with internal resistance 0.50 Ω is connected to a 4.0 Ω resistor. Calculate terminal pd.',
    maxMarks: 3,
    difficulty: 'Medium',
    hint: 'Find current then V=IR.',
    template: '',
    requiredKeywords: ['I=E/(R+r)', 'V=IR', '8.0 V'],
    markScheme: ['[C1] I=E/(R+r).', '[C1] V=IR.', '[A1] 8.0 V.'],
    modelAnswer: 'I=9.0/(4.0+0.50)=2.0 A, then V=2.0×4.0=8.0 V.',
  },
  {
    id: 'aqa-t1-1',
    year: 'Year 13',
    unit: '6. Further Mechanics',
    topic: 'Thermal Physics',
    subTopic: 'Specific Heat',
    commandWord: 'Calculate',
    commandWordDefinition: 'Use mathematics to solve a problem.',
    questionType: 'Short calculation',
    prompt: 'A 2.5 kW heater heats 1.2 kg of water from 20 °C to 100 °C. c=4200 J kg⁻¹ °C⁻¹. Calculate time.',
    maxMarks: 3,
    difficulty: 'Medium',
    hint: 'E=mcΔθ then t=E/P.',
    template: '',
    requiredKeywords: ['mcΔθ', 'power', '161 s'],
    markScheme: ['[C1] E=mcΔθ.', '[C1] t=E/P.', '[A1] 161 s.'],
    modelAnswer: 'E=1.2×4200×80=403200 J; t=403200/2500=161 s.',
  },
  {
    id: 'aqa-f1-1',
    year: 'Year 13',
    unit: '7. Fields',
    topic: 'Magnetic Fields',
    subTopic: 'Transformers',
    commandWord: 'Explain',
    commandWordDefinition: 'Set out purposes or reasons.',
    questionType: 'Extended 6-mark level-of-response',
    prompt: 'Explain how a step-down transformer works and discuss energy losses.',
    maxMarks: 6,
    difficulty: 'Hard',
    hint: 'AC, changing flux, Faraday, turns ratio, losses.',
    template: '',
    requiredKeywords: ['alternating current', 'magnetic flux', 'Faraday', 'induced emf', 'eddy currents', 'I²R', 'hysteresis'],
    markScheme: ['[L3 5-6] Clear induction chain plus at least two explained losses.', '[L2 3-4] Partial induction plus one loss.', '[L1 1-2] Fragmented relevant physics.'],
    modelAnswer: 'AC in the primary creates changing flux, inducing emf in the secondary. Fewer secondary turns gives lower voltage. Losses include resistive heating, eddy currents and hysteresis.',
  },
  {
    id: 'aqa-n1-1',
    year: 'Year 13',
    unit: '8. Nuclear Physics',
    topic: 'Radioactivity',
    subTopic: 'Isotopes',
    commandWord: 'Define',
    commandWordDefinition: 'State the meaning of a term.',
    questionType: 'Short explanation',
    prompt: 'State what is meant by isotopes.',
    maxMarks: 2,
    difficulty: 'Easy',
    hint: 'Same protons, different neutrons.',
    template: '',
    requiredKeywords: ['same protons', 'different neutrons'],
    markScheme: ['[B1] Same number of protons.', '[B1] Different number of neutrons.'],
    modelAnswer: 'Isotopes are atoms of the same element with the same number of protons but different numbers of neutrons.',
  },
];

export const questionCoverageAudit = specificationCoverageAudit();

export const questions: Question[] = [
  ...baseQuestions,
  ...correctedPracticeQuestions,
  ...generatedPracticeQuestions,
  ...electricityPracticeQuestions,
  ...specCoverageQuestions,
];
