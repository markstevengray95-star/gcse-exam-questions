export type ExamFocusTheme = {
  subject: 'Biology' | 'Chemistry' | 'Physics';
  topic: string;
  theme: string;
  priority: 'Very common' | 'Common';
  why: string;
  match: RegExp;
};

export const examFocusThemes: ExamFocusTheme[] = [
  { subject: 'Biology', topic: 'Cell biology', theme: 'Microscopy, cell structure and membrane transport', priority: 'Very common', why: 'Frequently combines recall, calculations and practical/application skills.', match: /microscop|cell|diffusion|osmosis|active transport|mitosis/i },
  { subject: 'Biology', topic: 'Organisation', theme: 'Enzymes, digestion, circulation and plant transport', priority: 'Very common', why: 'Often assessed through structure-function links, data and practical contexts.', match: /enzyme|digest|heart|blood|xylem|phloem|transpiration/i },
  { subject: 'Biology', topic: 'Infection and response', theme: 'Pathogens, immunity, vaccination and medicines', priority: 'Common', why: 'Recurring application questions test immune response and treatment decisions.', match: /pathogen|immune|vaccin|antibiotic|drug|antibody/i },
  { subject: 'Biology', topic: 'Bioenergetics', theme: 'Photosynthesis, respiration and limiting factors', priority: 'Very common', why: 'Often mixes equations, graphs, limiting-factor reasoning and practical method.', match: /photosynth|respirat|limiting|light|glucose|oxygen/i },
  { subject: 'Biology', topic: 'Inheritance, variation and evolution', theme: 'Genetics, meiosis, variation and natural selection', priority: 'Very common', why: 'Recent papers repeatedly use genetic reasoning, crosses and selection in unfamiliar contexts.', match: /genetic|meiosis|allele|variation|selection|evolution|mutation/i },
  { subject: 'Biology', topic: 'Ecology', theme: 'Sampling, food chains, cycles and biodiversity', priority: 'Very common', why: 'Common source of calculations, data interpretation and method/evaluation questions.', match: /quadrat|transect|biomass|food|carbon|biodiversity|ecosystem/i },

  { subject: 'Chemistry', topic: 'Atomic structure and the periodic table', theme: 'Atomic structure, isotopes and periodic trends', priority: 'Very common', why: 'Regularly assesses subatomic particles, atomic models and Group 1/7 trends.', match: /atom|isotope|periodic|group 1|group 7|electron/i },
  { subject: 'Chemistry', topic: 'Bonding, structure and properties', theme: 'Bonding, structure and property explanations', priority: 'Very common', why: 'A core recurring theme linking ionic, covalent and metallic models to properties.', match: /ionic|covalent|metallic|diamond|graphite|alloy|structure/i },
  { subject: 'Chemistry', topic: 'Quantitative chemistry', theme: 'Moles, reacting masses, concentration, yield and atom economy', priority: 'Very common', why: 'Calculation-heavy questions recur across papers and often include unit conversions.', match: /mole|mass|concentration|yield|atom economy|formula mass/i },
  { subject: 'Chemistry', topic: 'Chemical changes', theme: 'Reactivity, acids, salts and electrolysis', priority: 'Very common', why: 'Frequently combines equations, ions, practical method and product prediction.', match: /reactiv|acid|salt|electrolysis|oxid|reduc/i },
  { subject: 'Chemistry', topic: 'Energy changes', theme: 'Reaction profiles, activation energy and bond energies', priority: 'Common', why: 'Often tests diagrams, catalysts and Higher-tier bond-energy calculations.', match: /exother|endother|activation|bond energ|reaction profile|catalyst/i },
  { subject: 'Chemistry', topic: 'Rate and extent of chemical change', theme: 'Rates, collision theory and equilibrium', priority: 'Very common', why: 'Recent papers repeatedly use rate graphs, practical data and equilibrium reasoning.', match: /rate|collision|equilibrium|reversible|temperature|concentration/i },
  { subject: 'Chemistry', topic: 'Organic chemistry', theme: 'Crude oil, cracking, alkenes and polymers', priority: 'Common', why: 'Frequently appears through industrial contexts, structures and explanations.', match: /crude|fractional|cracking|alkene|polymer|hydrocarbon/i },
  { subject: 'Chemistry', topic: 'Chemical analysis', theme: 'Chromatography and identification tests', priority: 'Very common', why: 'Rf calculations and chemical tests are common short-answer/practical questions.', match: /chromat|rf|flame|gas test|precipitate|ion/i },

  { subject: 'Physics', topic: 'Energy', theme: 'Energy stores, power and efficiency', priority: 'Very common', why: 'Recent papers repeatedly combine energy transfers with multi-step calculations.', match: /energy|power|efficien|kinetic|potential|work/i },
  { subject: 'Physics', topic: 'Electricity', theme: 'Circuits, resistance, charge and electrical power', priority: 'Very common', why: 'A recurring calculation and explanation area with circuit interpretation.', match: /circuit|resistance|current|charge|voltage|potential difference|power/i },
  { subject: 'Physics', topic: 'Particle model of matter', theme: 'Density, specific heat capacity and gas behaviour', priority: 'Very common', why: 'Frequently assessed through practicals, equations, graphs and particle explanations.', match: /density|specific heat|latent|gas|pressure|particle/i },
  { subject: 'Physics', topic: 'Atomic structure', theme: 'Radiation, half-life and contamination', priority: 'Very common', why: 'Repeatedly tests decay calculations, risk comparisons and radiation properties.', match: /radiation|half-life|activity|alpha|beta|gamma|contamination/i },
  { subject: 'Physics', topic: 'Forces', theme: 'Motion, resultant force, springs and stopping distance', priority: 'Very common', why: 'One of the broadest Paper 2 areas and a frequent source of calculations and practical data.', match: /force|acceleration|spring|hooke|stopping|momentum|velocity/i },
  { subject: 'Physics', topic: 'Waves', theme: 'Wave calculations, refraction and electromagnetic waves', priority: 'Very common', why: 'Often combines equations, diagrams and application to EM-wave uses and hazards.', match: /wave|frequency|wavelength|refraction|electromagnetic|radiation/i },
  { subject: 'Physics', topic: 'Magnetism and electromagnetism', theme: 'Magnetic fields, motor effect and transformers', priority: 'Common', why: 'Recurring Paper 2 application area, particularly at Higher tier.', match: /magnet|motor|transformer|electromagnet|field/i },
  { subject: 'Physics', topic: 'Space physics', theme: 'Orbits, stellar evolution and red-shift', priority: 'Common', why: 'Separate Physics regularly samples these ideas and often uses extended explanations.', match: /orbit|star|red-shift|universe|solar/i },
];

export const examFocusNote =
  'Built from recurring themes seen across sampled recent AQA GCSE Science Higher papers and examiner materials. It is a revision prioritiser, not a prediction of a future paper.';
