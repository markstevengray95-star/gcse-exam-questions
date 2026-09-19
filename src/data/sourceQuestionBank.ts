import { makeSourceBankQuestion, type SourceBankSeed } from './sourceBankFactory';
import type { Question } from './questionTypes';

type Row = [number, string, string, string[], number | null, number | null, number | null];

const toSeed = (row: Row): SourceBankSeed => ({
  n: row[0],
  chapter: row[1],
  title: row[2],
  meta: row[3],
  targetMark: row[4],
  partialAwarded: row[5],
  partialTotal: row[6],
});

const physicsRows: Row[] = [
  [
    1,
    "Physics 4.1 Energy",
    "Changes in energy",
    [
      "SD",
      "Calculate",
      "Combined science"
    ],
    5,
    3,
    5
  ],
  [
    2,
    "Physics 4.1 Energy",
    "Specific heat capacity",
    [
      "LD",
      "Plan",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    3,
    "Physics 4.1 Energy",
    "Insulation",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    4,
    "Physics 4.1 Energy",
    "Global energy resources",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    5,
    "Physics 4.1 Energy",
    "Global energy resources",
    [
      "HD",
      "Evaluate",
      "Combined science"
    ],
    6,
    null,
    null
  ],
  [
    6,
    "Physics 4.1 Energy",
    "Energy and atomic structure",
    [
      "SD",
      "Compare",
      "Synoptic",
      "Physics only"
    ],
    6,
    5,
    6
  ],
  [
    7,
    "Physics 4.2 Electricity",
    "Current, potential difference and resistance",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    8,
    "Physics 4.2 Electricity",
    "Resistance",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    1,
    6
  ],
  [
    9,
    "Physics 4.2 Electricity",
    "Series and parallel circuits",
    [
      "HD",
      "Calculate",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    10,
    "Physics 4.2 Electricity",
    "Domestic uses and safety",
    [
      "LD",
      "Describe",
      "Combined science"
    ],
    4,
    3,
    4
  ],
  [
    11,
    "Physics 4.2 Electricity",
    "Energy and electricity",
    [
      "SD",
      "Explain",
      "Synoptic",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    12,
    "Physics 4.3 Particle model of matter",
    "Changes of state and the particle model",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    13,
    "Physics 4.3 Particle model of matter",
    "Internal energy and energy transfers",
    [
      "HD",
      "Determine",
      "Combined science"
    ],
    6,
    3,
    8
  ],
  [
    14,
    "Physics 4.3 Particle model of matter",
    "Particle model and pressure",
    [
      "LD",
      "Explain",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    15,
    "Physics 4.4 Atomic structure",
    "Atoms and isotopes",
    [
      "LD",
      "Compare",
      "Combined science"
    ],
    4,
    2,
    4
  ],
  [
    16,
    "Physics 4.4 Atomic structure",
    "Atoms and nuclear radiation",
    [
      "HD",
      "Evaluate",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    17,
    "Physics 4.4 Atomic structure",
    "Hazards and uses of radioactive emissions and background radiation",
    [
      "SD",
      "Compare",
      "Physics only"
    ],
    6,
    2,
    6
  ],
  [
    18,
    "Physics 4.4 Atomic structure",
    "The particle model of matter and Space physics",
    [
      "HD",
      "Evaluate",
      "Synoptic",
      "Physics only"
    ],
    6,
    4,
    6
  ],
  [
    19,
    "Physics 4.5 Forces",
    "Work done and energy transfer",
    [
      "LD",
      "Calculate",
      "Combined science"
    ],
    4,
    2,
    4
  ],
  [
    20,
    "Physics 4.5 Forces",
    "Forces and elasticity",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    21,
    "Physics 4.5 Forces",
    "Pressure and pressure difference in fluids",
    [
      "HD",
      "Calculate",
      "HT only",
      "Physics only"
    ],
    4,
    null,
    null
  ],
  [
    22,
    "Physics 4.5 Forces",
    "Forces and motion – Newton’s Laws",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    23,
    "Physics 4.5 Forces",
    "Momentum",
    [
      "HD",
      "Calculate",
      "HT only",
      "Physics only"
    ],
    6,
    3,
    6
  ],
  [
    24,
    "Physics 4.5 Forces",
    "Forces and energy",
    [
      "LD",
      "Explain",
      "Synoptic",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    25,
    "Physics 4.6 Waves",
    "Waves in air, fluids and solids",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    26,
    "Physics 4.6 Waves",
    "Reflection of waves",
    [
      "SD",
      "Plan",
      "Physics only"
    ],
    6,
    5,
    6
  ],
  [
    27,
    "Physics 4.6 Waves",
    "Electromagnetic waves",
    [
      "SD",
      "Plan",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    28,
    "Physics 4.6 Waves",
    "Lenses",
    [
      "HD",
      "Calculate",
      "Physics only"
    ],
    6,
    null,
    null
  ],
  [
    29,
    "Physics 4.6 Waves",
    "Black body radiation",
    [
      "LD",
      "Determine",
      "Physics only"
    ],
    4,
    1,
    4
  ],
  [
    30,
    "Physics 4.7 Magnetism and electromagnetism",
    "Permanent and induced magnetism, magnetic forces and fields",
    [
      "LD",
      "Design",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    31,
    "Physics 4.7 Magnetism and electromagnetism",
    "The motor effect",
    [
      "HD",
      "Calculate",
      "HT only",
      "Combined science"
    ],
    5,
    null,
    null
  ],
  [
    32,
    "Physics 4.7 Magnetism and electromagnetism",
    "Induced potential",
    [
      "HD",
      "Evaluate",
      "HT only",
      "Physics only"
    ],
    6,
    4,
    6
  ],
  [
    33,
    "Physics 4.7 Magnetism and electromagnetism",
    "Transformers and the National Grid",
    [
      "HD",
      "Calculate",
      "HT only",
      "Physics only"
    ],
    6,
    5,
    6
  ],
  [
    34,
    "Physics 4.8 Space physics",
    "Solar system; stability of orbital motions; satellites",
    [
      "LD",
      "Describe",
      "Physics only"
    ],
    6,
    3,
    6
  ],
  [
    35,
    "Physics 4.8 Space physics",
    "Red-shift",
    [
      "SD",
      "Evaluate",
      "Physics only"
    ],
    6,
    4,
    6
  ]
];
const biologyRows: Row[] = [
  [
    1,
    "Biology 4.1 Cell biology",
    "Cells and microscopy",
    [
      "LD",
      "Describe a method",
      "Combined science"
    ],
    4,
    2,
    4
  ],
  [
    2,
    "Biology 4.1 Cell biology",
    "Culturing microorganisms",
    [
      "SD",
      "Explain",
      "Biology only"
    ],
    6,
    4,
    6
  ],
  [
    3,
    "Biology 4.1 Cell biology",
    "Stem cells",
    [
      "HD",
      "Evaluate",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    4,
    "Biology 4.1 Cell biology",
    "Osmosis",
    [
      "SD",
      "Explain",
      "Combined science"
    ],
    null,
    4,
    6
  ],
  [
    5,
    "Biology 4.1 Cell biology",
    "Transport in cells",
    [
      "HD",
      "Compare",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    6,
    "Biology 4.2 Organisation",
    "Food tests",
    [
      "LD",
      "Evaluate",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    7,
    "Biology 4.2 Organisation",
    "Effect of pH on amylase",
    [
      "SD",
      "Determine/calculate",
      "Combined science"
    ],
    1,
    5,
    6
  ],
  [
    8,
    "Biology 4.2 Organisation",
    "Heart valves",
    [
      "HD",
      "Explain",
      "Synoptic",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    9,
    "Biology 4.2 Organisation",
    "Smoking tobacco",
    [
      "LD",
      "Describe",
      "Combined science"
    ],
    4,
    3,
    4
  ],
  [
    10,
    "Biology 4.2 Organisation",
    "Xylem and phloem",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    11,
    "Biology 4.3 Infection and response",
    "Human defence systems",
    [
      "LD",
      "Explain",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    12,
    "Biology 4.3 Infection and response",
    "Vaccination",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    13,
    "Biology 4.3 Infection and response",
    "Monoclonal antibodies",
    [
      "HD",
      "Describe",
      "HT only",
      "Biology only"
    ],
    6,
    5,
    6
  ],
  [
    14,
    "Biology 4.3 Infection and response",
    "Plant defence responses",
    [
      "SD",
      "Describe",
      "Biology only"
    ],
    6,
    5,
    6
  ],
  [
    15,
    "Biology 4.4 Bioenergetics",
    "Rate of photosynthesis",
    [
      "LD",
      "Plan",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    16,
    "Biology 4.4 Bioenergetics",
    "Aerobic and anaerobic respiration",
    [
      "HD",
      "Compare",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    17,
    "Biology 4.4 Bioenergetics",
    "Response to exercise",
    [
      "LD",
      "Calculate",
      "Combined science"
    ],
    2,
    3,
    4
  ],
  [
    18,
    "Biology 4.5 Homeostasis and response",
    "Reaction time",
    [
      "LD",
      "Calculate",
      "Combined science"
    ],
    1,
    2,
    4
  ],
  [
    19,
    "Biology 4.5 Homeostasis and response",
    "The eye",
    [
      "HD",
      "Describe",
      "Biology only"
    ],
    4,
    2,
    4
  ],
  [
    20,
    "Biology 4.5 Homeostasis and response",
    "Diabetes",
    [
      "LD",
      "Compare",
      "Combined science"
    ],
    4,
    3,
    4
  ],
  [
    21,
    "Biology 4.5 Homeostasis and response",
    "Contraception",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    22,
    "Biology 4.5 Homeostasis and response",
    "Homeostasis and negative feedback",
    [
      "HD",
      "Explain",
      "HT only",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    23,
    "Biology 4.5 Homeostasis and response",
    "Plant hormones",
    [
      "SD",
      "Plan",
      "Biology only"
    ],
    6,
    5,
    6
  ],
  [
    24,
    "Biology 4.6 Inheritance, variation and evolution",
    "Sexual and asexual reproduction",
    [
      "SD",
      "Explain",
      "Biology only"
    ],
    6,
    4,
    6
  ],
  [
    25,
    "Biology 4.6 Inheritance, variation and evolution",
    "DNA structure",
    [
      "HD",
      "Describe",
      "HT only",
      "Synoptic",
      "Biology only"
    ],
    6,
    4,
    6
  ],
  [
    26,
    "Biology 4.6 Inheritance, variation and evolution",
    "Genetic inheritance",
    [
      "HD",
      "Determine",
      "HT only",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    27,
    "Biology 4.6 Inheritance, variation and evolution",
    "Evolution",
    [
      "SD",
      "Explain",
      "Synoptic",
      "Combined science"
    ],
    1,
    3,
    4
  ],
  [
    28,
    "Biology 4.6 Inheritance, variation and evolution",
    "Selective breeding and genetic engineering",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    29,
    "Biology 4.6 Inheritance, variation and evolution",
    "Resistant bacteria",
    [
      "LD",
      "Evaluate",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    30,
    "Biology 4.7 Ecology",
    "Abiotic factors",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    31,
    "Biology 4.7 Ecology",
    "Adaptations and evolution",
    [
      "LD",
      "Compare",
      "Synoptic",
      "Combined science"
    ],
    2,
    2,
    4
  ],
  [
    32,
    "Biology 4.7 Ecology",
    "Measuring population size",
    [
      "LD",
      "Describe a method",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    33,
    "Biology 4.7 Ecology",
    "How materials are cycled",
    [
      "SD",
      "Describe",
      "Synoptic",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    34,
    "Biology 4.7 Ecology",
    "Rate of decay",
    [
      "HD",
      "Calculate",
      "Biology only"
    ],
    1,
    3,
    4
  ],
  [
    35,
    "Biology 4.7 Ecology",
    "Trophic levels and fossils",
    [
      "HD",
      "Explain",
      "Synoptic",
      "Biology only"
    ],
    6,
    4,
    6
  ]
];
const chemistryRows: Row[] = [
  [
    1,
    "Chemistry 4.1 Atomic structure and the periodic table",
    "Mixtures",
    [
      "LD",
      "Design",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    2,
    "Chemistry 4.1 Atomic structure and the periodic table",
    "Model of an atom",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    4,
    1,
    4
  ],
  [
    3,
    "Chemistry 4.1 Atomic structure and the periodic table",
    "The periodic table",
    [
      "SD",
      "Explain",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    4,
    "Chemistry 4.1 Atomic structure and the periodic table",
    "Transition metals",
    [
      "LD",
      "Compare",
      "Chemistry only"
    ],
    6,
    3,
    6
  ],
  [
    5,
    "Chemistry 4.2 Bonding, structure and the properties of matter",
    "Ionic bonding",
    [
      "LD",
      "Describe",
      "Combined science"
    ],
    4,
    3,
    4
  ],
  [
    6,
    "Chemistry 4.2 Bonding, structure and the properties of matter",
    "Small molecules and diamond",
    [
      "HD",
      "Compare",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    7,
    "Chemistry 4.2 Bonding, structure and the properties of matter",
    "Ionic and metallic bonding",
    [
      "HD",
      "Compare",
      "Combined science"
    ],
    6,
    1,
    6
  ],
  [
    8,
    "Chemistry 4.2 Bonding, structure and the properties of matter",
    "Models",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    9,
    "Chemistry 4.2 Bonding, structure and the properties of matter",
    "Nanoparticles",
    [
      "HD",
      "Evaluate",
      "Chemistry only"
    ],
    6,
    3,
    6
  ],
  [
    10,
    "Chemistry 4.3 Quantitative chemistry",
    "Law of conservation of mass",
    [
      "SD",
      "Explain",
      "Combined science"
    ],
    6,
    1,
    6
  ],
  [
    11,
    "Chemistry 4.3 Quantitative chemistry",
    "Limiting quantities",
    [
      "HD",
      "Show/calculate",
      "HT only",
      "Combined science"
    ],
    3,
    2,
    4
  ],
  [
    12,
    "Chemistry 4.3 Quantitative chemistry",
    "volumes and yields",
    [
      "SD and HD",
      "Show/give/calculate",
      "Concentrations, gas Synoptic",
      "HT only",
      "Combined science"
    ],
    4,
    5,
    7
  ],
  [
    13,
    "Chemistry 4.4 Chemical changes",
    "Titrations",
    [
      "SD",
      "Explain",
      "HT only",
      "Chemistry only"
    ],
    6,
    4,
    6
  ],
  [
    14,
    "Chemistry 4.4 Chemical changes",
    "Metal extraction",
    [
      "LD",
      "Explain",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    15,
    "Chemistry 4.4 Chemical changes",
    "Electrolysis",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    16,
    "Chemistry 4.4 Chemical changes",
    "Soluble salts",
    [
      "LD",
      "Explain",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    17,
    "Chemistry 4.5 Energy changes",
    "Energy changes and reactivity series",
    [
      "LD/SD",
      "Explain/describe",
      "Synoptic",
      "Combined science"
    ],
    6,
    2,
    3
  ],
  [
    18,
    "Chemistry 4.5 Energy changes",
    "Reaction profiles",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    19,
    "Chemistry 4.6 The rate and extent of chemical change",
    "Reactions of alkenes and alcohols",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    null,
    null
  ],
  [
    20,
    "Chemistry 4.6 The rate and extent of chemical change",
    "Chromatography",
    [
      "LD",
      "Plan",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    21,
    "Chemistry 4.6 The rate and extent of chemical change",
    "Flame tests",
    [
      "SD",
      "Describe",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    22,
    "Chemistry 4.7 Organic chemistry",
    "Fractional distillation and petrochemicals",
    [
      "SD",
      "Compare",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    23,
    "Chemistry 4.7 Organic chemistry",
    "Polymerisation",
    [
      "HD",
      "Compare",
      "HT only",
      "Chemistry only"
    ],
    4,
    2,
    5
  ],
  [
    24,
    "Chemistry 4.7 Organic chemistry",
    "Calculating rates of reactions",
    [
      "SD",
      "Calculate",
      "Combined science"
    ],
    4,
    2,
    6
  ],
  [
    25,
    "Chemistry 4.7 Organic chemistry",
    "Carboxylic acids",
    [
      "HD",
      "Design",
      "Synoptic",
      "HT only",
      "Chemistry only"
    ],
    6,
    2,
    7
  ],
  [
    26,
    "Chemistry 4.7 Organic chemistry",
    "Polymers",
    [
      "LD",
      "Compare",
      "Synoptic",
      "HT only",
      "Chemistry only"
    ],
    6,
    5,
    6
  ],
  [
    27,
    "Chemistry 4.8 Chemical analysis",
    "The effect of changing conditions on equilibrium",
    [
      "LD",
      "Evaluate",
      "Combined science"
    ],
    6,
    5,
    6
  ],
  [
    28,
    "Chemistry 4.8 Chemical analysis",
    "The effect of changing conditions on equilibrium",
    [
      "HD",
      "Explain",
      "HT only",
      "Combined science"
    ],
    4,
    3,
    4
  ],
  [
    29,
    "Chemistry 4.8 Chemical analysis",
    "Pure substances and formulations",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    3,
    6
  ],
  [
    30,
    "Chemistry 4.9 Chemistry of the atmosphere",
    "The proportions of different gases in the atmosphere",
    [
      "SD",
      "Explain",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    31,
    "Chemistry 4.9 Chemistry of the atmosphere",
    "Global climate change",
    [
      "LD",
      "Describe",
      "Combined science"
    ],
    4,
    4,
    5
  ],
  [
    32,
    "Chemistry 4.9 Chemistry of the atmosphere",
    "Atmospheric pollutants from fuels",
    [
      "SD",
      "Explain",
      "Combined science"
    ],
    6,
    4,
    6
  ],
  [
    33,
    "Chemistry 4.9 Chemistry of the atmosphere",
    "The proportions of different gases in the atmosphere",
    [
      "LD",
      "Describe",
      "Synoptic",
      "Combined science"
    ],
    4,
    6,
    8
  ],
  [
    34,
    "Chemistry 4.10 Using resources",
    "Potable water",
    [
      "LD",
      "Describe",
      "Combined science"
    ],
    4,
    4,
    5
  ],
  [
    35,
    "Chemistry 4.10 Using resources",
    "Life cycle assessment",
    [
      "SD",
      "Evaluate",
      "Combined science"
    ],
    6,
    2,
    6
  ],
  [
    36,
    "Chemistry 4.10 Using resources",
    "The Haber process",
    [
      "HD",
      "Evaluate",
      "HT only",
      "Chemistry only"
    ],
    6,
    3,
    6
  ]
];

export const physicsSourceBank: Question[] = physicsRows.map(row => makeSourceBankQuestion('Physics', toSeed(row)));
export const biologySourceBank: Question[] = biologyRows.map(row => makeSourceBankQuestion('Biology', toSeed(row)));
export const chemistrySourceBank: Question[] = chemistryRows.map(row => makeSourceBankQuestion('Chemistry', toSeed(row)));

export const sourceQuestionBank: Question[] = [
  ...biologySourceBank,
  ...chemistrySourceBank,
  ...physicsSourceBank,
];

export const sourceQuestionBankAudit = {
  total: sourceQuestionBank.length,
  Biology: biologySourceBank.length,
  Chemistry: chemistrySourceBank.length,
  Physics: physicsSourceBank.length,
  withPartialProfile: sourceQuestionBank.filter(question => Boolean(question.sourcePartialMark)).length,
};

if (sourceQuestionBankAudit.total !== 106) {
  throw new Error('Adapted uploaded question bank must contain exactly 106 main question sets.');
}
if (sourceQuestionBankAudit.Biology !== 35 || sourceQuestionBankAudit.Chemistry !== 36 || sourceQuestionBankAudit.Physics !== 35) {
  throw new Error('Adapted uploaded question bank subject counts do not match the source documents.');
}
