import { specCoverageQuestions, specificationCoverageAudit } from './specCoverageQuestions';
import { expandedQuestionBank } from './expandedQuestionBank';
import { recurringExamQuestionBank } from './recurringExamQuestionBank';
import { practicalAndCoreExpansion, practicalExpansionAudit } from './practicalAndCoreExpansion';
import { sourceQuestionBank, sourceQuestionBankAudit } from './sourceQuestionBank';
import type { Question } from './questionTypes';
export type { Question } from './questionTypes';

const calculationQuestions: Question[] = [
  {
    id: 'gcse-bio-magnification', year: 'Year 10', unit: 'Biology Paper 1', topic: 'Cell biology', subTopic: 'Microscopy and magnification', subject: 'Biology', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'An image of a cell is 48 mm long. The actual cell is 0.12 mm long. Calculate the magnification.',
    maxMarks: 2, difficulty: 'Easy', hint: 'magnification = image size ÷ actual size', template: 'magnification = ',
    requiredKeywords: ['magnification','image size','actual size','400'],
    markScheme: ['[C1] Uses magnification = image size ÷ actual size.', '[A1] 48 ÷ 0.12 = 400.'],
    modelAnswer: 'Magnification = 48 ÷ 0.12 = 400, so the image is ×400.',
  },
  {
    id: 'gcse-bio-osmosis-percent', year: 'Year 10', unit: 'Biology Paper 1', topic: 'Cell biology', subTopic: 'Osmosis', subject: 'Biology', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A potato cylinder has an initial mass of 5.0 g and a final mass of 5.8 g. Calculate the percentage increase in mass.',
    maxMarks: 3, difficulty: 'Medium', hint: 'percentage change = change ÷ original × 100', template: '',
    requiredKeywords: ['0.8','5.0','16%'],
    markScheme: ['[C1] Change in mass = 0.8 g.', '[C1] Uses 0.8 ÷ 5.0 × 100.', '[A1] 16%.'],
    modelAnswer: 'The mass increased by 0.8 g. Percentage increase = 0.8 ÷ 5.0 × 100 = 16%.',
  },
  {
    id: 'gcse-bio-biomass-efficiency', year: 'Year 11', unit: 'Biology Paper 2', topic: 'Ecology', subTopic: 'Trophic levels and biomass', subject: 'Biology', paper: 'Paper 2', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A herbivore gains 240 kJ of biomass energy from 2000 kJ available in the plants it eats. Calculate the percentage efficiency of transfer.',
    maxMarks: 2, difficulty: 'Easy', hint: 'efficiency = useful transfer ÷ total input × 100', template: '',
    requiredKeywords: ['240','2000','12%'],
    markScheme: ['[C1] Uses 240 ÷ 2000 × 100.', '[A1] 12%.'],
    modelAnswer: 'Efficiency = 240 ÷ 2000 × 100 = 12%.',
  },
  {
    id: 'gcse-chem-moles', year: 'Year 10', unit: 'Chemistry Paper 1', topic: 'Quantitative chemistry', subTopic: 'Moles', subject: 'Chemistry', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'Calculate the amount in moles in 9.0 g of water, H₂O. Relative atomic masses: H = 1, O = 16.',
    maxMarks: 3, difficulty: 'Medium', hint: 'First calculate Mr, then moles = mass ÷ Mr.', template: '',
    requiredKeywords: ['18','9.0','0.50 mol'],
    markScheme: ['[C1] Mr(H₂O) = 18.', '[C1] Uses moles = 9.0 ÷ 18.', '[A1] 0.50 mol.'],
    modelAnswer: 'Mr(H₂O) = 18. Moles = 9.0 ÷ 18 = 0.50 mol.',
  },
  {
    id: 'gcse-chem-concentration', year: 'Year 10', unit: 'Chemistry Paper 1', topic: 'Quantitative chemistry', subTopic: 'Concentration', subject: 'Chemistry', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A solution contains 12 g of solute in 0.40 dm³ of solution. Calculate the concentration in g/dm³.',
    maxMarks: 2, difficulty: 'Easy', hint: 'concentration = mass ÷ volume', template: '',
    requiredKeywords: ['12','0.40','30 g/dm³'],
    markScheme: ['[C1] Uses concentration = 12 ÷ 0.40.', '[A1] 30 g/dm³.'],
    modelAnswer: 'Concentration = 12 ÷ 0.40 = 30 g/dm³.',
  },
  {
    id: 'gcse-chem-atom-economy', year: 'Year 10', unit: 'Chemistry Paper 1', topic: 'Quantitative chemistry', subTopic: 'Atom economy', subject: 'Chemistry', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A reaction makes 68 g of desired product and 32 g of unwanted products. Calculate the atom economy for the desired product.',
    maxMarks: 2, difficulty: 'Medium', hint: 'atom economy = desired product ÷ total products × 100', template: '',
    requiredKeywords: ['68','100','68%'],
    markScheme: ['[C1] Uses 68 ÷ (68 + 32) × 100.', '[A1] 68%.'],
    modelAnswer: 'Total products = 100 g, so atom economy = 68 ÷ 100 × 100 = 68%.',
  },
  {
    id: 'gcse-chem-rate', year: 'Year 11', unit: 'Chemistry Paper 2', topic: 'Rate and extent of chemical change', subTopic: 'Average rate', subject: 'Chemistry', paper: 'Paper 2', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A reaction produces 72 cm³ of gas in 40 s. Calculate the mean rate of gas production.',
    maxMarks: 2, difficulty: 'Easy', hint: 'rate = quantity produced ÷ time', template: '',
    requiredKeywords: ['72','40','1.8 cm³/s'],
    markScheme: ['[C1] Uses rate = 72 ÷ 40.', '[A1] 1.8 cm³/s.'],
    modelAnswer: 'Mean rate = 72 ÷ 40 = 1.8 cm³/s.',
  },
  {
    id: 'gcse-chem-rf', year: 'Year 11', unit: 'Chemistry Paper 2', topic: 'Chemical analysis', subTopic: 'Chromatography', subject: 'Chemistry', paper: 'Paper 2', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A dye moves 4.2 cm while the solvent front moves 7.0 cm. Calculate the Rf value.',
    maxMarks: 2, difficulty: 'Easy', hint: 'Rf = distance moved by substance ÷ distance moved by solvent', template: '',
    requiredKeywords: ['4.2','7.0','0.60'],
    markScheme: ['[C1] Uses Rf = 4.2 ÷ 7.0.', '[A1] 0.60.'],
    modelAnswer: 'Rf = 4.2 ÷ 7.0 = 0.60.',
  },
  {
    id: 'gcse-phys-kinetic', year: 'Year 10', unit: 'Physics Paper 1', topic: 'Energy', subTopic: 'Kinetic energy', subject: 'Physics', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A 1200 kg car travels at 15 m/s. Calculate its kinetic energy.',
    maxMarks: 3, difficulty: 'Medium', hint: 'Eₖ = ½mv²', template: '',
    requiredKeywords: ['0.5','1200','15²','135000 J'],
    markScheme: ['[C1] Uses Eₖ = ½mv².', '[C1] Substitutes 0.5 × 1200 × 15².', '[A1] 135000 J.'],
    modelAnswer: 'Eₖ = 0.5 × 1200 × 15² = 135000 J.',
  },
  {
    id: 'gcse-phys-charge', year: 'Year 10', unit: 'Physics Paper 1', topic: 'Electricity', subTopic: 'Charge flow', subject: 'Physics', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A current of 0.80 A flows for 45 s. Calculate the charge transferred.',
    maxMarks: 2, difficulty: 'Easy', hint: 'Q = It', template: '',
    requiredKeywords: ['0.80','45','36 C'],
    markScheme: ['[C1] Uses Q = It.', '[A1] Q = 0.80 × 45 = 36 C.'],
    modelAnswer: 'Q = It = 0.80 × 45 = 36 C.',
  },
  {
    id: 'gcse-phys-density', year: 'Year 10', unit: 'Physics Paper 1', topic: 'Particle model of matter', subTopic: 'Density', subject: 'Physics', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A metal block has a mass of 540 g and a volume of 60 cm³. Calculate its density in g/cm³.',
    maxMarks: 2, difficulty: 'Easy', hint: 'density = mass ÷ volume', template: '',
    requiredKeywords: ['540','60','9.0 g/cm³'],
    markScheme: ['[C1] Uses density = 540 ÷ 60.', '[A1] 9.0 g/cm³.'],
    modelAnswer: 'Density = 540 ÷ 60 = 9.0 g/cm³.',
  },
  {
    id: 'gcse-phys-half-life', year: 'Year 10', unit: 'Physics Paper 1', topic: 'Atomic structure', subTopic: 'Half-life', subject: 'Physics', paper: 'Paper 1', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematical reasoning to determine the answer.', questionType: 'Short calculation',
    prompt: 'A radioactive source has a count rate of 800 counts per minute. Its half-life is 3 hours. What count rate would be expected after 9 hours?',
    maxMarks: 3, difficulty: 'Medium', hint: '9 hours contains three half-lives.', template: '',
    requiredKeywords: ['3 half-lives','800','400','200','100'],
    markScheme: ['[C1] Recognises 9 hours = 3 half-lives.', '[C1] Halves the count rate three times.', '[A1] 100 counts per minute.'],
    modelAnswer: 'Nine hours is three half-lives: 800 → 400 → 200 → 100 counts per minute.',
  },
  {
    id: 'gcse-phys-force', year: 'Year 11', unit: 'Physics Paper 2', topic: 'Forces', subTopic: 'Force and acceleration', subject: 'Physics', paper: 'Paper 2', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A 950 kg car accelerates at 2.4 m/s². Calculate the resultant force on the car.',
    maxMarks: 2, difficulty: 'Easy', hint: 'F = ma', template: '',
    requiredKeywords: ['950','2.4','2280 N'],
    markScheme: ['[C1] Uses F = ma.', '[A1] 950 × 2.4 = 2280 N.'],
    modelAnswer: 'F = ma = 950 × 2.4 = 2280 N.',
  },
  {
    id: 'gcse-phys-wave-speed', year: 'Year 11', unit: 'Physics Paper 2', topic: 'Waves', subTopic: 'Wave speed', subject: 'Physics', paper: 'Paper 2', course: 'Both', tier: 'Both',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A wave has a frequency of 250 Hz and a wavelength of 1.6 m. Calculate its speed.',
    maxMarks: 2, difficulty: 'Easy', hint: 'v = fλ', template: '',
    requiredKeywords: ['250','1.6','400 m/s'],
    markScheme: ['[C1] Uses v = fλ.', '[A1] 250 × 1.6 = 400 m/s.'],
    modelAnswer: 'v = fλ = 250 × 1.6 = 400 m/s.',
  },
  {
    id: 'gcse-phys-transformer', year: 'Year 11', unit: 'Physics Paper 2', topic: 'Magnetism and electromagnetism', subTopic: 'Transformers', subject: 'Physics', paper: 'Paper 2', course: 'Both', tier: 'Higher only',
    commandWord: 'Calculate', commandWordDefinition: 'Use mathematics to work out a numerical answer.', questionType: 'Short calculation',
    prompt: 'A transformer has 1200 turns on the primary coil and 60 turns on the secondary coil. The primary potential difference is 230 V. Calculate the secondary potential difference.',
    maxMarks: 3, difficulty: 'Hard', hint: 'Vp/Vs = Np/Ns', template: '',
    requiredKeywords: ['230','1200','60','11.5 V'],
    markScheme: ['[C1] Uses Vp/Vs = Np/Ns.', '[C1] Rearranges or substitutes correctly.', '[A1] Vs = 11.5 V.'],
    modelAnswer: '230/Vs = 1200/60 = 20, so Vs = 230/20 = 11.5 V.',
  },
];

export const questionCoverageAudit = specificationCoverageAudit();

export const questions: Question[] = [
  ...specCoverageQuestions,
  ...calculationQuestions,
  ...expandedQuestionBank,
  ...recurringExamQuestionBank,
  ...practicalAndCoreExpansion,
  ...sourceQuestionBank,
];

function auditQuestionBank(bank: Question[]) {
  const ids = new Set<string>();
  for (const question of bank) {
    if (ids.has(question.id)) throw new Error(`Duplicate GCSE Science question id: ${question.id}`);
    ids.add(question.id);
    if (!question.prompt.trim()) throw new Error(`Question ${question.id} has no prompt.`);
    if (question.maxMarks < 1 || question.maxMarks > 6) throw new Error(`Question ${question.id} has invalid marks.`);
    if (!question.markScheme.length) throw new Error(`Question ${question.id} has no mark scheme.`);
    if (!question.modelAnswer.trim()) throw new Error(`Question ${question.id} has no model answer.`);
    const practicalLinked = Boolean(question.pag) || question.topic.toLowerCase().includes('required practical');
    if (practicalLinked && question.maxMarks !== 6) {
      throw new Error(`Required-practical question ${question.id} must be worth exactly 6 marks.`);
    }
  }
  return {
    total: bank.length,
    Biology: bank.filter(question => question.subject === 'Biology').length,
    Chemistry: bank.filter(question => question.subject === 'Chemistry').length,
    Physics: bank.filter(question => question.subject === 'Physics').length,
    Science: bank.filter(question => question.subject === 'Science').length,
    calculations: bank.filter(question => question.questionType === 'Short calculation').length,
    extended: bank.filter(question => question.questionType === 'Extended 6-mark level-of-response').length,
    practicals: bank.filter(question => question.topic.toLowerCase().includes('required practical')).length,
    recurringExamStyle: recurringExamQuestionBank.length,
    practicalExpansion: practicalExpansionAudit,
    uploadedQuestionBank: sourceQuestionBankAudit,
  };
}

const mainTopics = [
  'Cell biology','Organisation','Infection and response','Bioenergetics','Homeostasis and response','Inheritance, variation and evolution','Ecology',
  'Atomic structure and the periodic table','Bonding, structure and properties','Quantitative chemistry','Chemical changes','Energy changes','Rate and extent of chemical change','Organic chemistry','Chemical analysis','Chemistry of the atmosphere','Using resources',
  'Energy','Electricity','Particle model of matter','Atomic structure','Forces','Waves','Magnetism and electromagnetism','Space physics',
];

for (const topic of mainTopics) {
  const topicQuestions = questions.filter(question => question.topic === topic);
  const subTopics = new Set(topicQuestions.map(question => question.subTopic));
  if (topicQuestions.length < 4) throw new Error('Insufficient question coverage for topic: ' + topic);
  if (subTopics.size < 3) throw new Error('Insufficient subtopic variety for topic: ' + topic);
}

export const questionBankAudit = auditQuestionBank(questions);

export const topicCoverageAudit = Object.fromEntries(
  [
    'Cell biology','Organisation','Infection and response','Bioenergetics','Homeostasis and response','Inheritance, variation and evolution','Ecology',
    'Atomic structure and the periodic table','Bonding, structure and properties','Quantitative chemistry','Chemical changes','Energy changes','Rate and extent of chemical change','Organic chemistry','Chemical analysis','Chemistry of the atmosphere','Using resources',
    'Energy','Electricity','Particle model of matter','Atomic structure','Forces','Waves','Magnetism and electromagnetism','Space physics',
  ].map(topic => {
    const topicQuestions = questions.filter(question => question.topic === topic);
    const subTopics = new Set(topicQuestions.map(question => question.subTopic));
    if (topicQuestions.length < 4) throw new Error('Insufficient question coverage for topic: ' + topic);
    if (subTopics.size < 3) throw new Error('Insufficient subtopic variety for topic: ' + topic);
    return [topic, { questions: topicQuestions.length, subTopics: subTopics.size }];
  }),
);

