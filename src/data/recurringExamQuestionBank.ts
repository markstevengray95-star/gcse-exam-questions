import type { Question } from './questionTypes';

type TopicMeta = Pick<Question, 'year' | 'unit' | 'subject' | 'paper' | 'course' | 'tier'>;

const topicMeta: Record<string, TopicMeta> = {
  "Cell biology": {
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "subject": "Biology",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Organisation": {
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "subject": "Biology",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Infection and response": {
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "subject": "Biology",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Bioenergetics": {
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "subject": "Biology",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Homeostasis and response": {
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "subject": "Biology",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Inheritance, variation and evolution": {
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "subject": "Biology",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Ecology": {
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "subject": "Biology",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Atomic structure and the periodic table": {
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "subject": "Chemistry",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Bonding, structure and properties": {
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "subject": "Chemistry",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Quantitative chemistry": {
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "subject": "Chemistry",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Chemical changes": {
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "subject": "Chemistry",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Energy changes": {
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "subject": "Chemistry",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Rate and extent of chemical change": {
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "subject": "Chemistry",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Organic chemistry": {
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "subject": "Chemistry",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Chemical analysis": {
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "subject": "Chemistry",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Chemistry of the atmosphere": {
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "subject": "Chemistry",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Using resources": {
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "subject": "Chemistry",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Energy": {
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "subject": "Physics",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Electricity": {
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "subject": "Physics",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Particle model of matter": {
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "subject": "Physics",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Atomic structure": {
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "subject": "Physics",
    "paper": "Paper 1",
    "course": "Both",
    "tier": "Both"
  },
  "Forces": {
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "subject": "Physics",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Waves": {
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "subject": "Physics",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Magnetism and electromagnetism": {
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "subject": "Physics",
    "paper": "Paper 2",
    "course": "Both",
    "tier": "Both"
  },
  "Space physics": {
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "subject": "Physics",
    "paper": "Paper 2",
    "course": "Separate only",
    "tier": "Both"
  }
};

const commandDefinitions: Record<string, string> = {
  Calculate: 'Use mathematics to work out a numerical answer and show relevant working.',
  Explain: 'Use scientific ideas to give linked reasons or mechanisms.',
  Describe: 'State what is observed, measured or happens, using precise scientific language.',
  Compare: 'Give linked similarities and differences using both items.',
  Evaluate: 'Use evidence to consider strengths and limitations and reach a justified conclusion.',
  Determine: 'Use the information provided to work out a value or conclusion.',
};

type Seed = {
  id: string;
  topic: string;
  subTopic: string;
  commandWord: string;
  prompt: string;
  points: string[];
  overrides?: Partial<Pick<Question, 'tier' | 'course' | 'difficulty'>>;
};

const seeds: Seed[] = [
  {
    "id": "rec-biol-cell-biology-1",
    "topic": "Cell biology",
    "subTopic": "Eukaryotic and prokaryotic cells",
    "commandWord": "Compare",
    "prompt": "Compare a bacterial cell with a typical animal cell.",
    "points": [
      "Both have a cell membrane and cytoplasm.",
      "A bacterial cell has no nucleus; its main DNA is a circular loop in the cytoplasm.",
      "Bacteria may contain plasmids and have a cell wall.",
      "Animal cells contain membrane-bound organelles such as mitochondria that bacteria do not have."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-cell-biology-2",
    "topic": "Cell biology",
    "subTopic": "Microscopy and scale",
    "commandWord": "Calculate",
    "prompt": "A cell image is 54 mm long at a magnification of ×1500. Calculate the actual cell length in micrometres.",
    "points": [
      "Use actual size = image size ÷ magnification.",
      "54 mm ÷ 1500 = 0.036 mm.",
      "Convert 0.036 mm to 36 µm."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-cell-biology-3",
    "topic": "Cell biology",
    "subTopic": "Active transport",
    "commandWord": "Explain",
    "prompt": "Explain why root hair cells sometimes use active transport to absorb mineral ions from soil.",
    "points": [
      "Mineral ion concentration can be lower in the soil than inside the root hair cell.",
      "The ions therefore need to move against the concentration gradient.",
      "Active transport uses energy released by respiration.",
      "Root hair cells have a large surface area that increases uptake."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-organisation-1",
    "topic": "Organisation",
    "subTopic": "Digestive enzymes",
    "commandWord": "Explain",
    "prompt": "Explain how enzymes in the digestive system make large food molecules suitable for absorption.",
    "points": [
      "Carbohydrases break carbohydrates into simple sugars.",
      "Proteases break proteins into amino acids.",
      "Lipases break lipids into glycerol and fatty acids.",
      "Digestion produces small soluble molecules that can pass through the wall of the small intestine."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-organisation-2",
    "topic": "Organisation",
    "subTopic": "Heart and circulation",
    "commandWord": "Compare",
    "prompt": "Compare arteries, veins and capillaries in relation to their structure and function.",
    "points": [
      "Arteries carry blood away from the heart at high pressure and have thick muscular elastic walls.",
      "Veins return blood to the heart at lower pressure and have valves.",
      "Capillaries have walls one cell thick for a short diffusion distance.",
      "Capillaries form networks with a large surface area for exchange."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-organisation-3",
    "topic": "Organisation",
    "subTopic": "Plant transport",
    "commandWord": "Explain",
    "prompt": "Explain how xylem and phloem are involved in transport through a plant.",
    "points": [
      "Xylem transports water and mineral ions from roots towards leaves.",
      "Water movement through xylem is linked to transpiration.",
      "Phloem transports dissolved sugars by translocation.",
      "Phloem can transport assimilates to growing or storage tissues."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-infection-and-response-1",
    "topic": "Infection and response",
    "subTopic": "Pathogens and transmission",
    "commandWord": "Compare",
    "prompt": "Compare how viral and bacterial pathogens cause disease.",
    "points": [
      "Viruses reproduce inside host cells and can damage the cells when new viruses are released.",
      "Bacteria are living cells that can reproduce rapidly in the body.",
      "Some bacteria produce toxins that damage tissues.",
      "Both can spread between hosts and trigger immune responses."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-infection-and-response-2",
    "topic": "Infection and response",
    "subTopic": "Human defence systems",
    "commandWord": "Explain",
    "prompt": "Explain how the body prevents pathogens entering and how white blood cells respond if pathogens enter.",
    "points": [
      "Skin forms a physical barrier.",
      "Mucus and cilia in the airways trap and move pathogens away from the lungs.",
      "Stomach acid destroys many swallowed microorganisms.",
      "White blood cells can engulf pathogens and produce specific antibodies."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-infection-and-response-3",
    "topic": "Infection and response",
    "subTopic": "Drug development",
    "commandWord": "Evaluate",
    "prompt": "Explain why a new medicine is tested in preclinical and clinical trials before widespread use.",
    "points": [
      "Preclinical testing investigates toxicity and whether the drug has an effect.",
      "Clinical trials start with low doses and investigate safety in humans.",
      "Later trials compare effectiveness and identify side effects using larger groups.",
      "Placebos, control groups and blinding reduce bias.",
      "Evidence is used to select a safe effective dose."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-bioenergetics-1",
    "topic": "Bioenergetics",
    "subTopic": "Photosynthesis and glucose",
    "commandWord": "Explain",
    "prompt": "Explain how a plant uses glucose made in photosynthesis.",
    "points": [
      "Glucose is used in respiration to release energy.",
      "Glucose can be converted to starch for storage.",
      "Glucose can be used to make cellulose for cell walls.",
      "Glucose can be combined with nitrate ions to make amino acids and then proteins."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-bioenergetics-2",
    "topic": "Bioenergetics",
    "subTopic": "Limiting factors",
    "commandWord": "Determine",
    "prompt": "A plant is tested at increasing light intensity. The rate of photosynthesis rises at first and then reaches a plateau. Determine what this suggests and explain how to test which factor is limiting at the plateau.",
    "points": [
      "Light is limiting at low light intensity.",
      "At the plateau light is no longer the limiting factor.",
      "Another factor such as carbon dioxide concentration or temperature is limiting.",
      "Change one possible limiting factor while keeping the others constant and observe whether the rate rises."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-bioenergetics-3",
    "topic": "Bioenergetics",
    "subTopic": "Aerobic and anaerobic respiration",
    "commandWord": "Compare",
    "prompt": "Compare aerobic respiration with anaerobic respiration in human muscle cells.",
    "points": [
      "Both transfer energy from glucose.",
      "Aerobic respiration requires oxygen and produces carbon dioxide and water.",
      "Anaerobic respiration occurs without enough oxygen and produces lactic acid.",
      "Anaerobic respiration transfers less energy from each glucose molecule."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-homeostasis-and-response-1",
    "topic": "Homeostasis and response",
    "subTopic": "Nervous system",
    "commandWord": "Explain",
    "prompt": "Explain how the nervous system produces a rapid response to a stimulus.",
    "points": [
      "Receptors detect a stimulus.",
      "Electrical impulses travel along sensory neurones to the central nervous system.",
      "The central nervous system coordinates a response.",
      "Motor neurones carry impulses to effectors such as muscles or glands."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-homeostasis-and-response-2",
    "topic": "Homeostasis and response",
    "subTopic": "Thermoregulation",
    "commandWord": "Explain",
    "prompt": "Explain how the body responds when core body temperature becomes too high.",
    "points": [
      "The thermoregulatory centre detects an increase in blood temperature.",
      "Sweat production increases so evaporation transfers energy from the skin.",
      "Blood vessels supplying skin capillaries dilate.",
      "More blood flows near the skin surface so more energy is transferred to the surroundings."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-homeostasis-and-response-3",
    "topic": "Homeostasis and response",
    "subTopic": "Hormonal control of reproduction",
    "commandWord": "Explain",
    "prompt": "Explain the roles of FSH, oestrogen and LH during the menstrual cycle.",
    "points": [
      "FSH stimulates maturation of an egg in an ovary.",
      "FSH also stimulates oestrogen production.",
      "Oestrogen helps rebuild the uterus lining and inhibits FSH.",
      "High oestrogen stimulates LH release.",
      "LH triggers ovulation."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-inheritance-variation-and-evolution-1",
    "topic": "Inheritance, variation and evolution",
    "subTopic": "Meiosis and fertilisation",
    "commandWord": "Explain",
    "prompt": "Explain how meiosis and fertilisation produce genetic variation in offspring.",
    "points": [
      "Meiosis produces gametes with one set of chromosomes.",
      "Meiosis creates genetically different gametes.",
      "At fertilisation one gamete from each parent fuses.",
      "The random combination of alleles from two parents produces variation in offspring."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-inheritance-variation-and-evolution-2",
    "topic": "Inheritance, variation and evolution",
    "subTopic": "Genetic crosses",
    "commandWord": "Determine",
    "prompt": "In pea plants, tall T is dominant to short t. A heterozygous tall plant is crossed with a short plant. Determine the probability of a short offspring.",
    "points": [
      "The parent genotypes are Tt and tt.",
      "Gametes from the heterozygous parent carry T or t, while the short parent produces t gametes.",
      "The possible offspring are Tt and tt in equal proportions.",
      "The probability of a short offspring is 1/2 or 50%."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-inheritance-variation-and-evolution-3",
    "topic": "Inheritance, variation and evolution",
    "subTopic": "Natural selection and evolution",
    "commandWord": "Explain",
    "prompt": "Explain how natural selection can change the characteristics of a population over many generations.",
    "points": [
      "Individuals in a population show inherited variation.",
      "Environmental conditions create selection pressures.",
      "Individuals with advantageous inherited characteristics are more likely to survive and reproduce.",
      "They pass relevant alleles to offspring.",
      "Over generations those alleles become more common, changing the population."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-ecology-1",
    "topic": "Ecology",
    "subTopic": "Quadrats and transects",
    "commandWord": "Evaluate",
    "prompt": "A student uses quadrats along a transect to investigate plant distribution from a path into a field. Explain how to improve the reliability and validity of the investigation.",
    "points": [
      "Use quadrats at regular distances along the transect.",
      "Repeat with several parallel transects or repeat samples.",
      "Use the same quadrat size and a consistent method for counting plants.",
      "Measure a relevant abiotic factor such as light intensity or soil moisture at each position.",
      "Calculate means and identify anomalous results."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-ecology-2",
    "topic": "Ecology",
    "subTopic": "Food chains and biomass",
    "commandWord": "Calculate",
    "prompt": "A producer population contains 24 000 kJ of energy. Primary consumers receive 2 880 kJ. Calculate the percentage efficiency of energy transfer.",
    "points": [
      "Use efficiency = energy transferred ÷ energy available × 100.",
      "Substitute 2880 ÷ 24000 × 100.",
      "Calculate 12%."
    ],
    "overrides": {}
  },
  {
    "id": "rec-biol-ecology-3",
    "topic": "Ecology",
    "subTopic": "Biodiversity and human impacts",
    "commandWord": "Evaluate",
    "prompt": "Evaluate two ways humans can reduce the loss of biodiversity caused by land use and waste.",
    "points": [
      "Protecting or restoring habitats preserves populations and breeding sites.",
      "Reducing deforestation limits habitat loss and carbon release.",
      "Recycling and reducing waste can reduce landfill, resource extraction and pollution.",
      "Conservation programmes can protect endangered species.",
      "A justified response recognises trade-offs such as land, cost and competing human needs."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-atomic-structure-and-the-periodic-table-1",
    "topic": "Atomic structure and the periodic table",
    "subTopic": "Atomic structure and isotopes",
    "commandWord": "Determine",
    "prompt": "An ion has 12 protons, 13 neutrons and 10 electrons. Determine its mass number and charge.",
    "points": [
      "Mass number = protons + neutrons = 25.",
      "The ion has two fewer electrons than protons.",
      "The ion therefore has a 2+ charge."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-atomic-structure-and-the-periodic-table-2",
    "topic": "Atomic structure and the periodic table",
    "subTopic": "Development of the atomic model",
    "commandWord": "Explain",
    "prompt": "Explain how the alpha-particle scattering experiment led scientists to change the plum pudding model of the atom.",
    "points": [
      "Most alpha particles passed straight through, showing atoms are mostly empty space.",
      "Some alpha particles were deflected.",
      "A very small number were reflected backwards.",
      "The results supported a small dense positively charged nucleus containing most of the mass."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-atomic-structure-and-the-periodic-table-3",
    "topic": "Atomic structure and the periodic table",
    "subTopic": "Periodic trends",
    "commandWord": "Compare",
    "prompt": "Compare the reactivity trends down Group 1 and Group 7 and explain each trend using electron structure.",
    "points": [
      "Group 1 becomes more reactive down the group.",
      "The outer electron is further from the nucleus and more shielded, so it is easier to lose.",
      "Group 7 becomes less reactive down the group.",
      "An incoming electron is further from the nucleus and more shielded, so attraction is weaker."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-bonding-structure-and-properties-1",
    "topic": "Bonding, structure and properties",
    "subTopic": "Ionic bonding",
    "commandWord": "Explain",
    "prompt": "Explain how magnesium and oxygen form magnesium oxide by ionic bonding.",
    "points": [
      "A magnesium atom loses two electrons to form Mg2+.",
      "An oxygen atom gains two electrons to form O2−.",
      "Oppositely charged ions attract by strong electrostatic forces.",
      "The ions form a giant ionic lattice."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-bonding-structure-and-properties-2",
    "topic": "Bonding, structure and properties",
    "subTopic": "Simple molecular and giant covalent structures",
    "commandWord": "Compare",
    "prompt": "Compare the melting points of methane and diamond using their structures and bonding.",
    "points": [
      "Methane consists of small molecules.",
      "Only weak intermolecular forces need to be overcome when methane melts or boils.",
      "Diamond is a giant covalent structure.",
      "Many strong covalent bonds must be overcome, so diamond has a very high melting point."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-bonding-structure-and-properties-3",
    "topic": "Bonding, structure and properties",
    "subTopic": "Metallic bonding and alloys",
    "commandWord": "Explain",
    "prompt": "Explain why metals conduct electricity and why alloys are usually harder than pure metals.",
    "points": [
      "Metals contain positive ions in a lattice with delocalised electrons.",
      "Delocalised electrons can move and carry charge.",
      "Pure metals have regular layers of similar-sized atoms that can slide.",
      "Different-sized atoms in an alloy distort the layers and make sliding more difficult."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-quantitative-chemistry-1",
    "topic": "Quantitative chemistry",
    "subTopic": "Relative formula mass and moles",
    "commandWord": "Calculate",
    "prompt": "Calculate the amount in moles in 11.7 g of sodium chloride, NaCl. Ar: Na = 23, Cl = 35.5.",
    "points": [
      "Calculate Mr(NaCl) = 58.5.",
      "Use moles = mass ÷ Mr.",
      "Calculate 11.7 ÷ 58.5 = 0.200 mol."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-quantitative-chemistry-2",
    "topic": "Quantitative chemistry",
    "subTopic": "Percentage yield",
    "commandWord": "Calculate",
    "prompt": "A reaction has a theoretical yield of 18.0 g but produces 13.5 g. Calculate the percentage yield.",
    "points": [
      "Use percentage yield = actual yield ÷ theoretical yield × 100.",
      "Substitute 13.5 ÷ 18.0 × 100.",
      "Calculate 75%."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-quantitative-chemistry-3",
    "topic": "Quantitative chemistry",
    "subTopic": "Concentration in mol/dm³",
    "commandWord": "Calculate",
    "prompt": "0.040 mol of solute is dissolved to make 200 cm³ of solution. Calculate the concentration in mol/dm³.",
    "points": [
      "Convert 200 cm³ to 0.200 dm³.",
      "Use concentration = moles ÷ volume in dm³.",
      "Calculate 0.040 ÷ 0.200 = 0.20 mol/dm³."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-chem-chemical-changes-1",
    "topic": "Chemical changes",
    "subTopic": "Reactivity series and extraction",
    "commandWord": "Explain",
    "prompt": "Explain why aluminium is extracted using electrolysis but iron can be extracted using carbon.",
    "points": [
      "Aluminium is more reactive than carbon.",
      "Carbon cannot reduce aluminium oxide, so electrolysis is required.",
      "Iron is less reactive than carbon.",
      "Carbon or carbon monoxide can remove oxygen from iron oxide."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemical-changes-2",
    "topic": "Chemical changes",
    "subTopic": "Acids and salts",
    "commandWord": "Describe",
    "prompt": "Describe how to prepare pure dry copper sulfate crystals from copper oxide and dilute sulfuric acid.",
    "points": [
      "Warm dilute sulfuric acid and add copper oxide until some remains unreacted.",
      "Filter to remove excess copper oxide.",
      "Heat the filtrate to evaporate some water.",
      "Allow the solution to cool so crystals form, then filter and dry the crystals."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemical-changes-3",
    "topic": "Chemical changes",
    "subTopic": "Electrolysis",
    "commandWord": "Explain",
    "prompt": "Explain the products formed during electrolysis of aqueous sodium chloride using inert electrodes.",
    "points": [
      "At the cathode hydrogen is produced because hydrogen is discharged instead of sodium.",
      "Hydrogen ions or water gain electrons at the cathode.",
      "At the anode chlorine is produced from chloride ions.",
      "Chloride ions lose electrons at the anode."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-chem-energy-changes-1",
    "topic": "Energy changes",
    "subTopic": "Exothermic and endothermic reactions",
    "commandWord": "Compare",
    "prompt": "Compare exothermic and endothermic reactions in terms of energy transfer and relative energies of products and reactants.",
    "points": [
      "Exothermic reactions transfer energy to the surroundings.",
      "Exothermic products are at lower energy than reactants.",
      "Endothermic reactions take in energy from the surroundings.",
      "Endothermic products are at higher energy than reactants."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-energy-changes-2",
    "topic": "Energy changes",
    "subTopic": "Activation energy and catalysts",
    "commandWord": "Explain",
    "prompt": "Explain how a catalyst changes a reaction profile and increases reaction rate.",
    "points": [
      "A catalyst provides an alternative reaction pathway.",
      "The alternative pathway has a lower activation energy.",
      "A greater proportion of collisions have enough energy to react.",
      "The catalyst is not used up overall."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-energy-changes-3",
    "topic": "Energy changes",
    "subTopic": "Bond energies",
    "commandWord": "Calculate",
    "prompt": "A reaction needs 1260 kJ/mol to break bonds and releases 1425 kJ/mol when new bonds form. Calculate the overall energy change and state the reaction type.",
    "points": [
      "Use energy change = energy to break bonds − energy released forming bonds.",
      "Calculate 1260 − 1425 = −165 kJ/mol.",
      "Identify the reaction as exothermic because the value is negative."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-chem-rate-and-extent-of-chemical-change-1",
    "topic": "Rate and extent of chemical change",
    "subTopic": "Collision theory",
    "commandWord": "Explain",
    "prompt": "Explain why increasing temperature usually increases the rate of a chemical reaction.",
    "points": [
      "Particles have more kinetic energy at higher temperature.",
      "Particles move faster and collide more frequently.",
      "A larger proportion of collisions have energy equal to or greater than activation energy.",
      "There are more successful collisions per second."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-rate-and-extent-of-chemical-change-2",
    "topic": "Rate and extent of chemical change",
    "subTopic": "Rate graphs",
    "commandWord": "Determine",
    "prompt": "Two experiments produce the same final volume of gas, but experiment A reaches the final volume in 40 s and experiment B in 75 s. Determine what can be concluded about their rates and amounts of product.",
    "points": [
      "Experiment A has the greater rate because it reaches the final volume sooner.",
      "Both experiments produce the same total amount of gas because the final volume is the same.",
      "The faster experiment would have a steeper initial gradient on a volume–time graph."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-rate-and-extent-of-chemical-change-3",
    "topic": "Rate and extent of chemical change",
    "subTopic": "Dynamic equilibrium",
    "commandWord": "Explain",
    "prompt": "A reversible reaction reaches dynamic equilibrium in a closed system. Explain what dynamic equilibrium means and what happens if a reactant concentration is increased.",
    "points": [
      "At equilibrium the forward and reverse reactions continue.",
      "Their rates are equal so macroscopic concentrations remain constant.",
      "Increasing reactant concentration disturbs the equilibrium.",
      "The equilibrium shifts in the direction that uses up some of the added reactant."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-chem-organic-chemistry-1",
    "topic": "Organic chemistry",
    "subTopic": "Fractional distillation",
    "commandWord": "Explain",
    "prompt": "Explain how fractional distillation separates crude oil into fractions.",
    "points": [
      "Crude oil is a mixture of hydrocarbons with different boiling points.",
      "The mixture is heated so most hydrocarbons vaporise.",
      "The fractionating column has a temperature gradient.",
      "Hydrocarbons condense at different heights according to their boiling points."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-organic-chemistry-2",
    "topic": "Organic chemistry",
    "subTopic": "Cracking",
    "commandWord": "Explain",
    "prompt": "Explain why long-chain hydrocarbons are cracked and identify the types of products formed.",
    "points": [
      "Long-chain hydrocarbons may be less useful or in lower demand.",
      "Cracking breaks large hydrocarbon molecules into smaller molecules.",
      "Products include shorter-chain alkanes.",
      "Products also include alkenes that can be used to make polymers."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-organic-chemistry-3",
    "topic": "Organic chemistry",
    "subTopic": "Alkenes and polymers",
    "commandWord": "Describe",
    "prompt": "Describe how an alkene can be distinguished from an alkane and how alkenes are used to make addition polymers.",
    "points": [
      "Bromine water is decolourised by an alkene but remains orange with an alkane.",
      "Alkenes contain a carbon–carbon double bond.",
      "During addition polymerisation many alkene monomers join together.",
      "The double bonds open to form long-chain polymer molecules."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemical-analysis-1",
    "topic": "Chemical analysis",
    "subTopic": "Chromatography",
    "commandWord": "Calculate",
    "prompt": "A substance moves 5.6 cm while the solvent front moves 8.0 cm. Calculate the Rf value.",
    "points": [
      "Use Rf = distance moved by substance ÷ distance moved by solvent.",
      "Substitute 5.6 ÷ 8.0.",
      "Calculate 0.70."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemical-analysis-2",
    "topic": "Chemical analysis",
    "subTopic": "Gas tests",
    "commandWord": "Describe",
    "prompt": "Describe the tests and positive results for hydrogen, oxygen and carbon dioxide gases.",
    "points": [
      "Hydrogen gives a squeaky pop with a lit splint.",
      "Oxygen relights a glowing splint.",
      "Carbon dioxide turns limewater cloudy or milky."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemical-analysis-3",
    "topic": "Chemical analysis",
    "subTopic": "Flame tests and ions",
    "commandWord": "Determine",
    "prompt": "A sample gives a lilac flame and produces a white precipitate when acidified silver nitrate is added. Determine the likely ions present.",
    "points": [
      "A lilac flame indicates potassium ions.",
      "A white precipitate with acidified silver nitrate indicates chloride ions.",
      "The evidence therefore suggests potassium chloride is present."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemistry-of-the-atmosphere-1",
    "topic": "Chemistry of the atmosphere",
    "subTopic": "Evolution of the atmosphere",
    "commandWord": "Explain",
    "prompt": "Explain how photosynthetic organisms changed the composition of Earth’s early atmosphere.",
    "points": [
      "Early photosynthetic organisms used carbon dioxide in photosynthesis.",
      "They released oxygen.",
      "Over long periods atmospheric carbon dioxide decreased and oxygen increased.",
      "Oxygen allowed ozone to form and supported aerobic organisms."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemistry-of-the-atmosphere-2",
    "topic": "Chemistry of the atmosphere",
    "subTopic": "Greenhouse effect",
    "commandWord": "Explain",
    "prompt": "Explain how greenhouse gases can increase the average temperature of Earth.",
    "points": [
      "Earth absorbs radiation from the Sun and emits infrared radiation.",
      "Greenhouse gases absorb some outgoing infrared radiation.",
      "They re-radiate energy in all directions including back toward Earth.",
      "Increasing greenhouse-gas concentration can reduce the net rate of energy loss to space."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-chemistry-of-the-atmosphere-3",
    "topic": "Chemistry of the atmosphere",
    "subTopic": "Atmospheric pollutants",
    "commandWord": "Compare",
    "prompt": "Compare the environmental effects of sulfur dioxide, oxides of nitrogen and particulates from combustion.",
    "points": [
      "Sulfur dioxide can contribute to acid rain.",
      "Oxides of nitrogen can contribute to acid rain and photochemical smog.",
      "Particulates can cause respiratory problems and reduce air quality.",
      "Particulates can also affect climate by absorbing or reflecting radiation."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-using-resources-1",
    "topic": "Using resources",
    "subTopic": "Potable water",
    "commandWord": "Describe",
    "prompt": "Describe the main steps used to produce potable water from fresh water sources.",
    "points": [
      "Choose a suitable source of fresh water.",
      "Filter the water to remove solids.",
      "Sterilise the water to kill microorganisms.",
      "Methods such as chlorine, ozone or ultraviolet treatment can be used for sterilisation."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-using-resources-2",
    "topic": "Using resources",
    "subTopic": "Life-cycle assessment",
    "commandWord": "Evaluate",
    "prompt": "Explain why a life-cycle assessment of a plastic bottle should include more than just what happens after the bottle is used.",
    "points": [
      "Raw-material extraction has environmental impacts.",
      "Manufacturing uses energy and other resources.",
      "Transport between stages creates emissions and uses fuel.",
      "Use and reuse can change total impact.",
      "Disposal, recycling or incineration also have different environmental effects."
    ],
    "overrides": {}
  },
  {
    "id": "rec-chem-using-resources-3",
    "topic": "Using resources",
    "subTopic": "Recycling finite resources",
    "commandWord": "Explain",
    "prompt": "Explain two benefits and one limitation of recycling metals.",
    "points": [
      "Recycling reduces the need to extract finite metal ores.",
      "It can reduce energy use and environmental damage from mining and extraction.",
      "Recycling may reduce waste sent to landfill.",
      "Collection, separation and processing still use energy and cost money."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-energy-1",
    "topic": "Energy",
    "subTopic": "Energy stores and transfers",
    "commandWord": "Explain",
    "prompt": "A cyclist brakes to a stop on a level road. Explain the energy transfers that occur.",
    "points": [
      "The cyclist and bicycle initially have energy in the kinetic store.",
      "Friction in the brakes and tyres does work.",
      "Energy is transferred to thermal stores of the brakes, tyres and surroundings.",
      "Total energy is conserved even though useful kinetic energy decreases."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-energy-2",
    "topic": "Energy",
    "subTopic": "Power",
    "commandWord": "Calculate",
    "prompt": "A machine transfers 48 000 J of energy in 80 s. Calculate its power.",
    "points": [
      "Use power = energy transferred ÷ time.",
      "Substitute 48 000 ÷ 80.",
      "Calculate 600 W."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-energy-3",
    "topic": "Energy",
    "subTopic": "Efficiency",
    "commandWord": "Evaluate",
    "prompt": "A device is redesigned so less energy is dissipated to the surroundings. Explain how this affects efficiency and why efficiency cannot exceed 100%.",
    "points": [
      "Efficiency compares useful energy output with total energy input.",
      "Reducing unwanted energy transfers increases the useful fraction and therefore efficiency.",
      "Energy is conserved so useful output cannot be greater than total input.",
      "Therefore efficiency cannot be greater than 100%."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-electricity-1",
    "topic": "Electricity",
    "subTopic": "Charge and current",
    "commandWord": "Calculate",
    "prompt": "A current of 1.5 A flows for 2.0 minutes. Calculate the charge transferred.",
    "points": [
      "Convert 2.0 minutes to 120 s.",
      "Use Q = It.",
      "Calculate Q = 1.5 × 120 = 180 C."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-electricity-2",
    "topic": "Electricity",
    "subTopic": "Resistance and I–V characteristics",
    "commandWord": "Explain",
    "prompt": "Explain why the resistance of a filament lamp increases as the current through it increases.",
    "points": [
      "Increasing current increases the temperature of the filament.",
      "The metal ions vibrate more strongly at higher temperature.",
      "Electrons collide more frequently with the vibrating ions.",
      "This makes charge flow more difficult, so resistance increases."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-electricity-3",
    "topic": "Electricity",
    "subTopic": "Domestic electricity and power",
    "commandWord": "Calculate",
    "prompt": "A 2.3 kW kettle is connected to a 230 V supply. Calculate the current in the kettle.",
    "points": [
      "Convert 2.3 kW to 2300 W.",
      "Use P = VI.",
      "Rearrange to I = P ÷ V.",
      "Calculate 2300 ÷ 230 = 10 A."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-particle-model-of-matter-1",
    "topic": "Particle model of matter",
    "subTopic": "Density",
    "commandWord": "Calculate",
    "prompt": "A block has a mass of 1.62 kg and a volume of 2.0 × 10⁻⁴ m³. Calculate its density.",
    "points": [
      "Use density = mass ÷ volume.",
      "Substitute 1.62 ÷ (2.0 × 10⁻⁴).",
      "Calculate 8100 kg/m³."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-particle-model-of-matter-2",
    "topic": "Particle model of matter",
    "subTopic": "Specific heat capacity",
    "commandWord": "Calculate",
    "prompt": "A 0.80 kg substance receives 18 000 J and its temperature rises by 25 °C. Calculate its specific heat capacity.",
    "points": [
      "Use E = mcΔθ.",
      "Rearrange c = E ÷ (mΔθ).",
      "Substitute 18 000 ÷ (0.80 × 25).",
      "Calculate 900 J/kg °C."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-particle-model-of-matter-3",
    "topic": "Particle model of matter",
    "subTopic": "Gas pressure",
    "commandWord": "Explain",
    "prompt": "Explain why the pressure of a fixed mass of gas in a sealed rigid container increases when the gas is heated.",
    "points": [
      "Heating increases the kinetic energy of gas particles.",
      "Particles move faster.",
      "They collide with the container walls more frequently.",
      "Collisions also involve a greater rate of change of momentum, increasing force per unit area and pressure."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-phys-atomic-structure-1",
    "topic": "Atomic structure",
    "subTopic": "Nuclear radiation",
    "commandWord": "Compare",
    "prompt": "Compare alpha, beta and gamma radiation in terms of nature, ionising power and penetration.",
    "points": [
      "Alpha particles are helium nuclei, are strongly ionising and have low penetration.",
      "Beta radiation consists of fast electrons and has intermediate ionising and penetrating ability.",
      "Gamma is electromagnetic radiation, is weakly ionising and highly penetrating.",
      "Suitable shielding becomes progressively thicker from alpha to beta to gamma."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-atomic-structure-2",
    "topic": "Atomic structure",
    "subTopic": "Half-life",
    "commandWord": "Calculate",
    "prompt": "A source has an activity of 960 Bq and a half-life of 6 hours. Calculate its activity after 18 hours.",
    "points": [
      "Recognise 18 hours is three half-lives.",
      "Halve 960 three times: 960 → 480 → 240 → 120.",
      "Calculate 120 Bq."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-atomic-structure-3",
    "topic": "Atomic structure",
    "subTopic": "Contamination and irradiation",
    "commandWord": "Compare",
    "prompt": "Compare radioactive contamination with irradiation and explain why contamination can continue to expose a person after leaving the source.",
    "points": [
      "Irradiation means exposure to radiation from an external source.",
      "Contamination means unwanted radioactive material is on or inside an object or person.",
      "Irradiation ends when the external source is removed or shielded.",
      "Contaminating material continues to emit radiation until it is removed or decays."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-forces-1",
    "topic": "Forces",
    "subTopic": "Acceleration and resultant force",
    "commandWord": "Calculate",
    "prompt": "A 1200 kg car increases speed from 8.0 m/s to 20.0 m/s in 6.0 s. Calculate the acceleration and resultant force.",
    "points": [
      "Use a = (v − u) ÷ t.",
      "Calculate acceleration = (20.0 − 8.0) ÷ 6.0 = 2.0 m/s².",
      "Use F = ma.",
      "Calculate force = 1200 × 2.0 = 2400 N."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-forces-2",
    "topic": "Forces",
    "subTopic": "Force and extension",
    "commandWord": "Determine",
    "prompt": "A spring extends 3.0 cm under a force of 6.0 N while obeying Hooke’s law. Determine the force needed for an extension of 7.5 cm.",
    "points": [
      "Recognise force is proportional to extension in the Hooke’s-law region.",
      "Calculate force per cm = 6.0 ÷ 3.0 = 2.0 N/cm.",
      "Calculate 7.5 × 2.0 = 15 N."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-forces-3",
    "topic": "Forces",
    "subTopic": "Stopping distance",
    "commandWord": "Explain",
    "prompt": "Explain why doubling the speed of a car can increase its braking distance by more than a factor of two.",
    "points": [
      "A faster car has more kinetic energy.",
      "Kinetic energy is proportional to the square of speed.",
      "The brakes must transfer a much larger amount of energy to thermal stores.",
      "For a similar braking force this requires a longer distance."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-phys-waves-1",
    "topic": "Waves",
    "subTopic": "Wave equation",
    "commandWord": "Calculate",
    "prompt": "A wave has frequency 320 Hz and wavelength 1.25 m. Calculate its speed.",
    "points": [
      "Use wave speed = frequency × wavelength.",
      "Substitute 320 × 1.25.",
      "Calculate 400 m/s."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-waves-2",
    "topic": "Waves",
    "subTopic": "Refraction",
    "commandWord": "Explain",
    "prompt": "Explain why a water wave changes direction when it enters a shallower region at an angle.",
    "points": [
      "The wave speed changes when water depth changes.",
      "The part of the wavefront entering shallow water first slows first.",
      "This changes the direction of the wavefront.",
      "The wave refracts towards the normal when its speed decreases."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-waves-3",
    "topic": "Waves",
    "subTopic": "Electromagnetic waves",
    "commandWord": "Compare",
    "prompt": "Compare two uses of electromagnetic waves with the hazards that must be considered.",
    "points": [
      "Different electromagnetic waves have different interactions with matter and therefore different uses.",
      "For example X-rays can image bones because they are transmitted differently by tissues but are ionising.",
      "Ultraviolet can cause fluorescence or sterilisation but can damage cells and DNA.",
      "Risk is reduced by limiting exposure, shielding or choosing an appropriate wavelength and dose."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-magnetism-and-electromagnetism-1",
    "topic": "Magnetism and electromagnetism",
    "subTopic": "Magnetic fields",
    "commandWord": "Describe",
    "prompt": "Describe the magnetic field around a bar magnet and how a compass can be used to map it.",
    "points": [
      "Field lines outside the magnet go from the north pole to the south pole.",
      "Lines are closer where the field is stronger.",
      "A compass aligns with the local magnetic field direction.",
      "Moving the compass to different positions allows the field direction to be plotted."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-magnetism-and-electromagnetism-2",
    "topic": "Magnetism and electromagnetism",
    "subTopic": "Motor effect",
    "commandWord": "Explain",
    "prompt": "Explain how the force on a current-carrying wire in a magnetic field can be increased.",
    "points": [
      "Increase the current in the wire.",
      "Increase the magnetic field strength.",
      "Increase the length of wire within the magnetic field.",
      "The force arises from interaction between the magnetic field of the current and the external field."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-magnetism-and-electromagnetism-3",
    "topic": "Magnetism and electromagnetism",
    "subTopic": "Transformers",
    "commandWord": "Calculate",
    "prompt": "A transformer has 800 turns on the primary and 200 turns on the secondary. The primary potential difference is 240 V. Calculate the secondary potential difference.",
    "points": [
      "Use Vp ÷ Vs = Np ÷ Ns.",
      "Substitute 240 ÷ Vs = 800 ÷ 200 = 4.",
      "Calculate Vs = 60 V."
    ],
    "overrides": {
      "tier": "Higher only"
    }
  },
  {
    "id": "rec-phys-space-physics-1",
    "topic": "Space physics",
    "subTopic": "Solar system and orbits",
    "commandWord": "Explain",
    "prompt": "Explain why a planet in a circular orbit is accelerating even if its speed is constant.",
    "points": [
      "Velocity depends on both speed and direction.",
      "The direction of the planet’s velocity is continuously changing.",
      "A change in velocity means the planet is accelerating.",
      "Gravity provides the resultant centripetal force towards the star."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-space-physics-2",
    "topic": "Space physics",
    "subTopic": "Life cycle of stars",
    "commandWord": "Describe",
    "prompt": "Describe the main stages in the life cycle of a star with a similar mass to the Sun.",
    "points": [
      "A star forms from a nebula as gravity pulls gas and dust together.",
      "It becomes a main-sequence star when fusion balances gravitational collapse.",
      "It expands into a red giant after hydrogen in the core becomes depleted.",
      "Outer layers are shed, leaving a white dwarf that eventually cools."
    ],
    "overrides": {}
  },
  {
    "id": "rec-phys-space-physics-3",
    "topic": "Space physics",
    "subTopic": "Red-shift",
    "commandWord": "Explain",
    "prompt": "Explain how red-shift observations support the idea that the universe is expanding.",
    "points": [
      "Spectral lines from distant galaxies are shifted to longer wavelengths.",
      "Longer wavelength indicates the galaxies are moving away from us.",
      "More distant galaxies generally show greater red-shift and recession speed.",
      "This overall pattern supports an expanding-universe model."
    ],
    "overrides": {}
  }
];

function makeQuestion(seed: Seed): Question {
  const meta = topicMeta[seed.topic];
  if (!meta) throw new Error('Missing metadata for recurring topic: ' + seed.topic);
  const maxMarks = Math.min(6, Math.max(1, seed.points.length));
  const questionType: Question['questionType'] =
    seed.commandWord === 'Calculate' ? 'Short calculation' :
    maxMarks >= 6 ? 'Extended 6-mark level-of-response' :
    seed.commandWord === 'Determine' ? 'Data analysis' :
    'Short explanation';

  return {
    ...meta,
    ...seed.overrides,
    id: seed.id,
    topic: seed.topic,
    subTopic: seed.subTopic,
    commandWord: seed.commandWord,
    commandWordDefinition: commandDefinitions[seed.commandWord] || 'Answer the command word directly using relevant scientific knowledge.',
    questionType,
    prompt: seed.prompt,
    maxMarks,
    difficulty: seed.overrides?.difficulty || (maxMarks >= 5 ? 'Hard' : maxMarks >= 3 ? 'Medium' : 'Easy'),
    hint: '',
    template: '',
    requiredKeywords: seed.points
      .flatMap(point => point.toLowerCase().split(/\W+/).filter(word => word.length > 5))
      .slice(0, 10),
    markScheme: seed.points.map((point, index) => '[M' + (index + 1) + '] ' + point),
    modelAnswer: seed.points.join(' '),
  };
}

export const recurringExamQuestionBank: Question[] = seeds.map(makeQuestion);

if (recurringExamQuestionBank.length !== 75) {
  throw new Error('Recurring exam question bank must contain exactly 75 questions; found ' + recurringExamQuestionBank.length + '.');
}
