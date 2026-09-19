import type { Question } from './questionTypes';

export type SourceBankSeed = {
  n: number;
  chapter: string;
  title: string;
  meta: string[];
  targetMark: number | null;
  partialAwarded: number | null;
  partialTotal: number | null;
  focus: string[];
};

type CalculationVariant = {
  prompt: string;
  points: string[];
  answer: string;
};

const calculationVariants: Record<string, CalculationVariant> = {
  'Physics|Changes in energy': {
    prompt: 'A 420 kg test capsule is launched vertically at 46 m/s in a vacuum. Calculate its initial kinetic energy and hence estimate the maximum height reached. Use g = 9.8 N/kg.',
    points: ['Uses Ek = 1/2 mv².', 'Calculates the initial kinetic energy correctly.', 'States that maximum kinetic energy is transferred to gravitational potential energy.', 'Uses ΔEp = mgh.', 'Calculates a maximum height of about 108 m with a suitable unit.'],
    answer: 'Ek = 0.5 × 420 × 46² = 444 360 J. At maximum height KE has been transferred to GPE, so h = 444 360 ÷ (420 × 9.8) ≈ 108 m.',
  },
  'Physics|Series and parallel circuits': {
    prompt: 'Two 6.0 Ω resistors are connected in parallel. This parallel pair is then connected in series with a 3.0 Ω resistor to a 12 V supply. Calculate the total resistance and the total current from the supply.',
    points: ['Calculates the parallel pair resistance as 3.0 Ω.', 'Adds the 3.0 Ω series resistor to obtain 6.0 Ω total.', 'Uses V = IR.', 'Rearranges I = V/R.', 'Substitutes 12 V and 6.0 Ω.', 'Calculates total current = 2.0 A.'],
    answer: 'Two equal 6.0 Ω resistors in parallel have a combined resistance of 3.0 Ω. Adding the 3.0 Ω series resistor gives 6.0 Ω. I = V/R = 12/6.0 = 2.0 A.',
  },
  'Physics|Internal energy and energy transfers': {
    prompt: 'A heater transfers 90 000 J to melt 0.30 kg of a solid at its melting point. Determine the specific latent heat of fusion.',
    points: ['Uses E = mL.', 'Rearranges to L = E/m.', 'Substitutes 90 000 J and 0.30 kg.', 'Calculates 300 000 J/kg.', 'Uses the correct unit.', 'Recognises that temperature stays constant during the change of state.'],
    answer: 'L = E/m = 90 000/0.30 = 300 000 J/kg. The energy changes the state rather than raising the temperature while melting occurs.',
  },
  'Physics|Work done and energy transfer': {
    prompt: 'A constant force of 180 N moves a crate 12 m in the direction of the force. Calculate the work done and state the energy transferred.',
    points: ['Uses W = Fs.', 'Substitutes 180 N and 12 m.', 'Calculates 2160 J.', 'States that 2160 J of energy is transferred.'],
    answer: 'W = Fs = 180 × 12 = 2160 J, so 2160 J of energy is transferred.',
  },
  'Physics|Pressure and pressure difference in fluids': {
    prompt: 'Sea water has density 1020 kg/m³. Calculate the pressure increase 18 m below the surface due to the water. Use g = 9.8 N/kg.',
    points: ['Uses p = hρg.', 'Substitutes 18, 1020 and 9.8.', 'Calculates about 1.80 × 10^5 Pa.', 'Gives pressure in pascals.'],
    answer: 'p = hρg = 18 × 1020 × 9.8 = 179 928 Pa ≈ 1.80 × 10^5 Pa.',
  },
  'Physics|Momentum': {
    prompt: 'A 500 kg wagon moving at 4.0 m/s collides with a stationary 300 kg wagon. The wagons couple together. Calculate their speed immediately after the collision.',
    points: ['Uses conservation of momentum.', 'Calculates initial momentum = 500 × 4.0 = 2000 kg m/s.', 'Total mass after collision = 800 kg.', 'Uses 2000 = 800v.', 'Calculates v = 2.5 m/s.', 'Uses a correct velocity unit.'],
    answer: 'Initial momentum = 2000 kg m/s. After coupling, 2000 = 800v, so v = 2.5 m/s.',
  },
  'Physics|Lenses': {
    prompt: 'A converging lens produces an image 36 mm high from an object 12 mm high. Calculate the magnification and explain what the value means.',
    points: ['Uses magnification = image height/object height.', 'Substitutes 36/12.', 'Calculates magnification = 3.0.', 'States magnification has no unit.', 'Explains the image is three times the object height.', 'Uses the relationship correctly.'],
    answer: 'Magnification = 36/12 = 3.0. This means the image is three times as high as the object.',
  },
  'Physics|Black body radiation': {
    prompt: 'Two black-body emission curves are shown for objects A and B. Object A has a higher peak intensity and its peak is at a shorter wavelength. Determine which object is hotter and explain your reasoning.',
    points: ['Identifies object A as hotter.', 'Uses the greater emitted intensity as evidence.', 'Uses the shift of the peak to shorter wavelength as evidence.', 'Links higher temperature to increased radiation intensity.'],
    answer: 'Object A is hotter because hotter objects emit more radiation overall and their intensity peak moves to shorter wavelengths.',
  },
  'Physics|The motor effect': {
    prompt: 'A 0.12 m length of wire carries 4.0 A at right angles to a magnetic field of flux density 0.35 T. Calculate the force on the wire.',
    points: ['Uses F = BIL.', 'Uses the length in metres.', 'Substitutes 0.35 × 4.0 × 0.12.', 'Calculates 0.168 N.', 'Uses newtons as the unit.'],
    answer: 'F = BIL = 0.35 × 4.0 × 0.12 = 0.168 N.',
  },
  'Physics|Transformers and the National Grid': {
    prompt: 'An ideal transformer has 1150 turns on its primary coil and 60 turns on its secondary coil. The primary potential difference is 230 V. Calculate the secondary potential difference.',
    points: ['Uses Vp/Vs = Np/Ns.', 'Substitutes the primary and secondary turns.', 'Rearranges correctly for Vs.', 'Calculates Vs = 12 V.', 'Uses volts as the unit.', 'Recognises that the transformer is step-down.'],
    answer: '230/Vs = 1150/60, so Vs = 230 × 60/1150 = 12 V. The transformer is step-down.',
  },
  'Biology|Effect of pH on amylase': {
    prompt: 'Starch is completely digested in 90 s at pH 5, 50 s at pH 6, 25 s at pH 7, 40 s at pH 8 and 75 s at pH 9. Determine the optimum pH and calculate the reaction rate there using rate = 1/time.',
    points: ['Identifies pH 7 as the optimum from the shortest time.', 'Uses rate = 1/time.', 'Substitutes 1/25.', 'Calculates 0.040 s⁻¹.', 'Uses the data to justify the optimum.', 'Recognises that shorter time means faster reaction.'],
    answer: 'The optimum is pH 7 because the digestion time is shortest. Rate = 1/25 = 0.040 s⁻¹.',
  },
  'Biology|Response to exercise': {
    prompt: 'A student counts 48 heart beats in 30 s during exercise. Calculate the heart rate in beats per minute and the increase compared with a resting rate of 68 beats per minute.',
    points: ['Doubles 48 beats in 30 s to obtain 96 beats per minute.', 'Calculates the increase as 96 − 68 = 28 beats per minute.', 'Uses beats per minute correctly.', 'Shows clear working.'],
    answer: 'Heart rate = 48 × 2 = 96 bpm. Increase = 96 − 68 = 28 bpm.',
  },
  'Biology|Reaction time': {
    prompt: 'A student records reaction times of 0.22, 0.19, 0.21, 0.20 and 0.28 s. Calculate the mean and identify the result that is most likely to be anomalous.',
    points: ['Adds the five reaction times correctly.', 'Divides by five to obtain a mean of 0.22 s.', 'Identifies 0.28 s as the likely anomaly.', 'Uses seconds as the unit.'],
    answer: 'Mean = (0.22 + 0.19 + 0.21 + 0.20 + 0.28)/5 = 0.22 s. The 0.28 s result is furthest from the others and is the likely anomaly.',
  },
  'Biology|Genetic inheritance': {
    prompt: 'Spotted fur B is dominant to black fur b. A heterozygous spotted animal is crossed with a black animal. Determine the probability that an offspring has black fur.',
    points: ['Uses parent genotypes Bb and bb.', 'Identifies gametes B or b from the heterozygous parent and b from the black parent.', 'Obtains offspring genotypes Bb and bb.', 'Identifies bb as black.', 'Calculates probability = 1/2.', 'Expresses this as 50%.'],
    answer: 'Bb × bb gives equal numbers of Bb and bb offspring. Therefore the probability of black fur is 1/2 = 50%.',
  },
  'Biology|Rate of decay': {
    prompt: 'The pH of a milk sample falls from 6.8 to 5.2 in 8.0 hours. Calculate the mean rate of pH decrease per hour.',
    points: ['Calculates pH change = 1.6.', 'Uses rate = change/time.', 'Calculates 1.6/8.0 = 0.20.', 'States 0.20 pH units per hour.'],
    answer: 'Mean rate = (6.8 − 5.2)/8.0 = 0.20 pH units per hour.',
  },
  'Chemistry|Limiting quantities': {
    prompt: 'Magnesium reacts with hydrochloric acid: Mg + 2HCl → MgCl₂ + H₂. A mixture contains 0.10 mol Mg and 0.15 mol HCl. Determine the limiting reactant and the maximum amount in moles of MgCl₂ formed.',
    points: ['Uses the 1:2 Mg:HCl ratio.', 'Recognises that 0.10 mol Mg would require 0.20 mol HCl.', 'Identifies HCl as limiting.', 'Calculates Mg reacting = 0.15/2 = 0.075 mol.', 'Uses the 1:1 Mg:MgCl₂ ratio.', 'Maximum MgCl₂ = 0.075 mol.'],
    answer: '0.10 mol Mg needs 0.20 mol HCl, but only 0.15 mol is present, so HCl is limiting. 0.15/2 = 0.075 mol Mg reacts, producing 0.075 mol MgCl₂.',
  },
  'Chemistry|volumes and yields': {
    prompt: 'A solution contains 0.050 mol of solute in 250 cm³. Calculate its concentration in mol/dm³. A reaction using the solution has a theoretical yield of 8.0 g and an actual yield of 6.4 g; calculate the percentage yield.',
    points: ['Converts 250 cm³ to 0.250 dm³.', 'Uses concentration = moles/volume.', 'Calculates concentration = 0.20 mol/dm³.', 'Uses percentage yield = actual/theoretical × 100.', 'Substitutes 6.4/8.0 × 100.', 'Calculates percentage yield = 80%.'],
    answer: 'Concentration = 0.050/0.250 = 0.20 mol/dm³. Percentage yield = 6.4/8.0 × 100 = 80%.',
  },
  'Chemistry|Calculating rates of reactions': {
    prompt: 'A reaction produces 84 cm³ of gas in 35 s. Calculate the mean rate of gas production.',
    points: ['Uses rate = quantity/time.', 'Substitutes 84 cm³ and 35 s.', 'Calculates 2.4 cm³/s.', 'Uses the correct compound unit.'],
    answer: 'Mean rate = 84/35 = 2.4 cm³/s.',
  },
};

function topicFromChapter(chapter: string) {
  return chapter.replace(/^(Biology|Chemistry|Physics)\s+\d+\.\d+\s+/, '').trim();
}

function paperFor(subject: string, chapter: string): 'Paper 1' | 'Paper 2' {
  const match = chapter.match(/\s4\.(\d+)/);
  const section = Number(match?.[1] || 1);
  if (subject === 'Biology') return section <= 4 ? 'Paper 1' : 'Paper 2';
  if (subject === 'Chemistry') return section <= 5 ? 'Paper 1' : 'Paper 2';
  return section <= 4 ? 'Paper 1' : 'Paper 2';
}

function commandFromMeta(meta: string[]) {
  const raw = meta.join(' ').toLowerCase();
  if (raw.includes('plan')) return 'Plan';
  if (raw.includes('design')) return 'Design';
  if (raw.includes('evaluate')) return 'Evaluate';
  if (raw.includes('compare')) return 'Compare';
  if (raw.includes('calculate') || raw.includes('show/give/calculate') || raw.includes('show/calculate')) return 'Calculate';
  if (raw.includes('determine')) return 'Determine';
  if (raw.includes('describe')) return 'Describe';
  if (raw.includes('explain')) return 'Explain';
  return 'Explain';
}

function commandDefinition(command: string) {
  const definitions: Record<string, string> = {
    Plan: 'Write a method.',
    Design: 'Set out how something will be done.',
    Evaluate: 'Use evidence and scientific knowledge to consider strengths and limitations and make a judgement.',
    Compare: 'Describe similarities and/or differences between things, not just one of them.',
    Calculate: 'Use numbers given in the question to work out the answer.',
    Determine: 'Use given data or information to obtain an answer.',
    Describe: 'Give an accurate account of facts, events or a process.',
    Explain: 'Make something clear or state the reasons for something happening.',
  };
  return definitions[command] || definitions.Explain;
}

function cleanFocus(seed: SourceBankSeed) {
  const generic = new Set(['changes','global','model','models','effect','different','number','value','values','result','results','student','answer']);
  return seed.focus.filter(word => !generic.has(word.toLowerCase())).slice(0, 7);
}

function genericPrompt(seed: SourceBankSeed, command: string, focus: string[]) {
  const keyIdeas = focus.length ? ` Key ideas include ${focus.slice(0, 4).join(', ')}.` : '';
  if (command === 'Plan') return `Plan a school-science investigation linked to ${seed.title.toLowerCase()} that would produce valid results. Include measurements, control variables, repeats and how the results would be processed.${keyIdeas}`;
  if (command === 'Design') return `Design a scientifically valid investigation or procedure linked to ${seed.title.toLowerCase()}. Explain the key measurements and controls that would make the outcome valid.${keyIdeas}`;
  if (command === 'Compare') return `Compare the key scientific features involved in ${seed.title.toLowerCase()}. Make direct comparative statements and link structure, process or evidence to the resulting properties or effects.${keyIdeas}`;
  if (command === 'Evaluate') return `Evaluate a scientific claim, method or choice involving ${seed.title.toLowerCase()}. Use relevant evidence, consider limitations or alternatives, and give a justified conclusion.${keyIdeas}`;
  if (command === 'Determine') return `Use the information and scientific relationships associated with ${seed.title.toLowerCase()} to determine a justified conclusion. Show how the evidence supports your answer.${keyIdeas}`;
  if (command === 'Describe') return `Describe the key science involved in ${seed.title.toLowerCase()} in a clear logical sequence.${keyIdeas}`;
  return `Explain the science involved in ${seed.title.toLowerCase()} using linked cause-and-effect statements.${keyIdeas}`;
}

function genericMarkScheme(seed: SourceBankSeed, command: string, maxMarks: number, focus: string[]) {
  const ideas = focus.length ? focus : seed.title.toLowerCase().split(/\W+/).filter(Boolean);
  const idea = (index: number) => ideas[index % Math.max(1, ideas.length)] || seed.title;
  const plan = [
    `[M1] Identifies suitable apparatus or a scientifically valid approach for ${seed.title}.`,
    '[M2] Identifies what is changed or compared and what is measured.',
    '[M3] Controls important variables or uses an appropriate comparison/control.',
    '[M4] Makes measurements with suitable range, precision or timing.',
    '[M5] Uses repeats/means or another method to improve reliability.',
    '[M6] Explains how results would be processed, displayed or used to reach a conclusion.',
  ];
  const compare = [
    `[M1] Makes a correct direct comparison involving ${idea(0)}.`,
    `[M2] Makes a second scientifically correct comparison involving ${idea(1)}.`,
    `[M3] Links a difference or similarity to ${idea(2)}.`,
    `[M4] Uses accurate terminology associated with ${idea(3)}.`,
    `[M5] Develops the comparison with a relevant consequence or property.`,
    '[M6] Maintains direct comparison rather than writing two unrelated descriptions.',
  ];
  const evaluate = [
    `[M1] Identifies relevant evidence or a benefit involving ${idea(0)}.`,
    `[M2] Identifies a limitation, risk or counterargument involving ${idea(1)}.`,
    `[M3] Uses scientific knowledge associated with ${idea(2)} to explain the evidence.`,
    `[M4] Considers reliability, practicality or an alternative interpretation.`,
    '[M5] Weighs the competing evidence rather than listing isolated points.',
    '[M6] Gives a justified conclusion linked to the evidence considered.',
  ];
  const explain = [
    `[M1] States a correct scientific point involving ${idea(0)}.`,
    `[M2] Links this point to ${idea(1)} using cause and effect.`,
    `[M3] Develops the explanation using ${idea(2)}.`,
    `[M4] Uses accurate terminology associated with ${idea(3)}.`,
    '[M5] Applies the science to the context rather than only recalling a definition.',
    '[M6] Forms a coherent chain of reasoning that answers the command word.',
  ];
  const describe = [
    `[M1] Gives an accurate statement involving ${idea(0)}.`,
    `[M2] Adds a relevant detail involving ${idea(1)}.`,
    `[M3] Uses correct scientific terminology associated with ${idea(2)}.`,
    `[M4] Gives the process or features in a logical sequence.`,
    '[M5] Includes enough specific detail for the description to be unambiguous.',
    '[M6] Covers the full scope of the question without irrelevant material.',
  ];
  const determine = [
    `[M1] Selects relevant information involving ${idea(0)}.`,
    `[M2] Uses a correct scientific relationship involving ${idea(1)}.`,
    `[M3] Processes or interprets the information correctly.`,
    `[M4] Uses ${idea(2)} to support the conclusion.`,
    '[M5] Shows sufficient reasoning rather than giving an unsupported answer.',
    '[M6] Reaches a justified conclusion consistent with the evidence.',
  ];
  const source = command === 'Plan' || command === 'Design' ? plan : command === 'Compare' ? compare : command === 'Evaluate' ? evaluate : command === 'Describe' ? describe : command === 'Determine' ? determine : explain;
  return source.slice(0, maxMarks);
}

function scaledPartial(seed: SourceBankSeed, total: number) {
  if (seed.partialAwarded == null || seed.partialTotal == null || seed.partialTotal <= 0) return undefined;
  const awarded = Math.max(0, Math.min(total, Math.round((seed.partialAwarded / seed.partialTotal) * total)));
  return { awarded, total };
}

export function makeSourceBankQuestion(subject: 'Biology' | 'Chemistry' | 'Physics', seed: SourceBankSeed): Question {
  const command = commandFromMeta(seed.meta);
  const variant = calculationVariants[`${subject}|${seed.title}`];
  const sourceTotal = seed.partialTotal || seed.targetMark || 6;
  const maxMarks = Math.max(2, Math.min(6, sourceTotal));
  const paper = paperFor(subject, seed.chapter);
  const focus = cleanFocus(seed);
  const markScheme = variant?.points.map((point, index) => `[M${index + 1}] ${point}`) || genericMarkScheme(seed, command, maxMarks, focus);
  const prompt = variant?.prompt || genericPrompt(seed, command, focus);
  const course: Question['course'] = seed.meta.some(item => /Biology only|Chemistry only|Physics only/i.test(item)) ? 'Separate only' : 'Both';
  const tier: Question['tier'] = seed.meta.some(item => /HT only/i.test(item)) ? 'Higher only' : 'Both';
  const difficulty: Question['difficulty'] = seed.meta.some(item => /HD/i.test(item)) ? 'Hard' : seed.meta.some(item => /LD/i.test(item)) ? 'Easy' : 'Medium';
  const modelAnswer = variant?.answer || markScheme.map(item => item.replace(/^\[[^\]]+\]\s*/, '')).join(' ');

  return {
    id: `source-${subject.toLowerCase()}-${String(seed.n).padStart(2, '0')}`,
    year: paper === 'Paper 1' ? 'Year 10' : 'Year 11',
    unit: `${subject} ${paper}`,
    topic: topicFromChapter(seed.chapter),
    subTopic: seed.title,
    subject,
    paper,
    course,
    tier,
    commandWord: variant ? (command === 'Determine' ? 'Determine' : 'Calculate') : command,
    commandWordDefinition: commandDefinition(variant ? (command === 'Determine' ? 'Determine' : 'Calculate') : command),
    questionType: variant
      ? (command === 'Determine' ? 'Data analysis' : 'Short calculation')
      : maxMarks === 6
        ? 'Extended 6-mark level-of-response'
        : command === 'Determine'
          ? 'Data analysis'
          : 'Short explanation',
    prompt,
    maxMarks,
    difficulty,
    hint: variant ? 'Write the equation or relationship first, then show substitution and units.' : `Use the command word ${command} carefully and build linked scientific points.`,
    template: '',
    requiredKeywords: Array.from(new Set([seed.title.toLowerCase(), ...focus])).slice(0, 10),
    markScheme,
    modelAnswer,
    bankSource: `${subject} question bank` as Question['bankSource'],
    bankReference: `${subject} bank question ${seed.n}: ${seed.title}`,
    sourcePartialMark: scaledPartial(seed, maxMarks),
  };
}
