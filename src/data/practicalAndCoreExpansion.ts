import type { Question } from './questionTypes';

type Subject = 'Biology' | 'Chemistry' | 'Physics';

type PracticalSeed = {
  id: string;
  subject: Subject;
  rp: number;
  title: string;
  year: 'Year 10' | 'Year 11';
  course: Question['course'];
  prompt: string;
  points: [string, string, string, string, string, string] | string[];
};

type TheorySeed = {
  id: string;
  subject: Subject;
  year: 'Year 10' | 'Year 11';
  unit: string;
  topic: string;
  subTopic: string;
  paper: Question['paper'];
  tier: Question['tier'];
  course: Question['course'];
  commandWord: string;
  prompt: string;
  points: string[];
};

const practicalSeeds: PracticalSeed[] = [
  {
    "id": "rp-bio-01",
    "subject": "Biology",
    "rp": 1,
    "title": "Microscopy",
    "year": "Year 10",
    "course": "Both",
    "prompt": "A student uses a light microscope to observe onion cells. Describe and evaluate a method that would produce an accurate labelled biological drawing with a magnification scale.",
    "points": [
      "Prepare a thin specimen on a slide and add a suitable stain before placing a coverslip carefully.",
      "Start with the lowest-power objective, focus clearly, then increase magnification if needed.",
      "Use the stage controls and fine focus to obtain a sharp image and avoid drawing artefacts.",
      "Produce a large clear line drawing with single unbroken lines and no shading, labelling visible structures accurately.",
      "Measure image size and actual or scale-bar size consistently so magnification can be calculated or a scale added.",
      "Repeat observations across more than one field of view or specimen and note how this improves reliability and representativeness."
    ]
  },
  {
    "id": "rp-bio-02",
    "subject": "Biology",
    "rp": 2,
    "title": "Antiseptics and antibiotics on bacterial growth",
    "year": "Year 10",
    "course": "Separate only",
    "prompt": "Plan and evaluate an investigation comparing the effect of different antiseptics on bacterial growth using agar plates.",
    "points": [
      "Use aseptic technique and sterile equipment so unwanted microorganisms do not contaminate the plates.",
      "Spread the same bacterial culture evenly and use equal-sized paper discs with measured volumes or concentrations of antiseptic.",
      "Include a suitable control disc and keep incubation time, temperature, agar depth and bacterial species the same.",
      "Incubate plates safely at an appropriate school-laboratory temperature and keep lids secured according to school microbiology procedures.",
      "Measure zones of inhibition consistently, for example diameter or area, and repeat each antiseptic to calculate a mean.",
      "A larger mean inhibition zone suggests greater effectiveness, but limitations such as diffusion rate and concentration should be considered."
    ]
  },
  {
    "id": "rp-bio-03",
    "subject": "Biology",
    "rp": 3,
    "title": "Osmosis in plant tissue",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan an investigation into how sugar-solution concentration affects the mass of potato cylinders and explain how the results should be analysed.",
    "points": [
      "Cut potato cylinders to the same dimensions and measure their initial masses using the same balance.",
      "Place them in a suitable range of known sugar concentrations using equal solution volumes.",
      "Keep temperature, time immersed, potato source and cylinder surface area controlled.",
      "Remove cylinders after the same time and blot them in a consistent way before measuring final mass.",
      "Repeat each concentration, calculate a mean percentage change in mass and identify anomalies.",
      "Plot percentage change against concentration and use the zero-change point to estimate the isotonic concentration."
    ]
  },
  {
    "id": "rp-bio-04",
    "subject": "Biology",
    "rp": 4,
    "title": "Food tests",
    "year": "Year 10",
    "course": "Both",
    "prompt": "A student is given an unknown food sample. Describe a method to test it for reducing sugars, starch and protein, and explain how reliable conclusions can be obtained.",
    "points": [
      "Prepare a food solution or suspension using clean apparatus and separate samples for each test.",
      "For reducing sugar add Benedict’s reagent and heat in a hot-water bath; a positive result changes from blue through green/yellow/orange to brick red.",
      "For starch add iodine solution; a positive result changes from orange-brown to blue-black.",
      "For protein add Biuret reagent; a positive result changes from blue to lilac or purple.",
      "Use clean labelled apparatus and known positive/negative controls so colour changes can be interpreted confidently.",
      "Repeat unclear tests and use the same sample volumes/reagent amounts so comparisons are valid."
    ]
  },
  {
    "id": "rp-bio-05",
    "subject": "Biology",
    "rp": 5,
    "title": "Effect of pH on amylase",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation of the effect of pH on the rate at which amylase breaks down starch.",
    "points": [
      "Use buffer solutions to set a range of pH values and keep amylase, starch volumes and concentrations constant.",
      "Keep temperature constant with a water bath or electric heater and allow solutions to reach that temperature.",
      "Mix amylase and starch, start timing immediately and sample the mixture at regular intervals onto iodine.",
      "Record the time when iodine no longer turns blue-black, showing starch has been digested.",
      "Repeat each pH, calculate a mean time or rate such as 1/time and identify anomalies.",
      "Plot rate against pH and use the peak to estimate the optimum while discussing timing and colour-judgement uncertainty."
    ]
  },
  {
    "id": "rp-bio-06",
    "subject": "Biology",
    "rp": 6,
    "title": "Light intensity and photosynthesis",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan an investigation into how light intensity affects the rate of photosynthesis in pondweed and explain how to improve the quality of the data.",
    "points": [
      "Place pondweed in water with a controlled carbon-dioxide supply and vary lamp distance or measured light intensity.",
      "Measure photosynthesis by counting bubbles over a fixed time or, preferably, collecting oxygen volume.",
      "Keep temperature, pondweed length/species, carbon dioxide concentration and measurement time controlled.",
      "Use several light intensities and allow the plant to equilibrate before each measurement.",
      "Repeat at each intensity, calculate a mean rate and identify anomalous readings.",
      "Plot rate against light intensity; if using distance discuss inverse-square behaviour and limitations of bubble counting."
    ]
  },
  {
    "id": "rp-bio-07",
    "subject": "Biology",
    "rp": 7,
    "title": "Human reaction time",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into the effect of one factor on human reaction time.",
    "points": [
      "Choose a clearly defined factor such as distraction and state a testable hypothesis.",
      "Use a standardised reaction-time method such as ruler drop, keeping drop height/start position and instructions consistent.",
      "Use the same participant under both conditions or a sufficiently large participant sample to reduce person-to-person variation.",
      "Repeat measurements in each condition, randomise order where appropriate and calculate mean reaction time or ruler distance.",
      "Control confounding factors such as practice, fatigue, dominant hand and environmental distractions.",
      "Use safe and ethical procedures, obtain consent where appropriate and evaluate whether the data support the hypothesis."
    ]
  },
  {
    "id": "rp-bio-08",
    "subject": "Biology",
    "rp": 8,
    "title": "Seedling responses to light or gravity",
    "year": "Year 11",
    "course": "Separate only",
    "prompt": "Plan and evaluate an investigation into the effect of light direction on the growth of newly germinated seedlings.",
    "points": [
      "Use similar newly germinated seedlings and expose groups to a controlled directional light treatment plus a suitable control.",
      "Keep temperature, water supply, growth time, species and starting seedling size as similar as possible.",
      "Measure growth length and direction at consistent times and produce accurate labelled biological drawings.",
      "Use enough seedlings in each treatment to reduce the effect of individual biological variation.",
      "Calculate appropriate means and compare the direction or extent of growth between conditions.",
      "Explain the response in terms of plant hormones/phototropism and evaluate limitations such as unequal starting growth or light intensity."
    ]
  },
  {
    "id": "rp-bio-09",
    "subject": "Biology",
    "rp": 9,
    "title": "Ecological sampling",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate a field investigation of how an abiotic factor affects the distribution of a plant species.",
    "points": [
      "Choose an abiotic factor such as light intensity or soil moisture and form a testable hypothesis.",
      "Use a transect with quadrats placed at regular intervals, or random quadrats where abundance rather than a gradient is investigated.",
      "Record abundance or percentage cover consistently and measure the abiotic factor at corresponding sampling points.",
      "Use enough quadrats and, where possible, repeat transects to make the sample more representative.",
      "Calculate means or other suitable summaries and plot an appropriate graph of abundance against the abiotic factor.",
      "Evaluate sampling bias, identification error, changing environmental conditions and whether correlation supports but does not prove causation."
    ]
  },
  {
    "id": "rp-bio-10",
    "subject": "Biology",
    "rp": 10,
    "title": "Temperature and decay of milk",
    "year": "Year 11",
    "course": "Separate only",
    "prompt": "Plan and evaluate an investigation into how temperature affects the rate of decay of fresh milk using pH change.",
    "points": [
      "Place equal volumes of the same fresh milk into containers held at a range of controlled temperatures.",
      "Measure initial pH with the same calibrated method and record pH at regular equal time intervals.",
      "Keep milk source, volume, container size and measurement schedule constant.",
      "Use safe microbiological handling and avoid unnecessary opening or contamination of samples.",
      "Repeat each temperature, calculate mean pH change per unit time and plot a suitable graph.",
      "Conclude how temperature affects decay rate while evaluating thermometer/pH uncertainty and the limits of pH as a proxy for microbial activity."
    ]
  },
  {
    "id": "rp-chem-01",
    "subject": "Chemistry",
    "rp": 1,
    "title": "Preparation of a soluble salt",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Describe and evaluate a method to prepare pure, dry copper sulfate crystals from copper oxide and dilute sulfuric acid.",
    "points": [
      "Warm dilute sulfuric acid gently and add copper oxide in small portions with stirring.",
      "Continue adding copper oxide until some remains unreacted so all acid has been neutralised.",
      "Filter the mixture to remove excess insoluble copper oxide.",
      "Heat the filtrate gently to evaporate some water and form a concentrated solution.",
      "Allow the solution to cool so crystals form, then filter and dry the crystals.",
      "Explain how using excess solid, filtration and controlled evaporation improve purity and yield while reducing spitting or overheating."
    ]
  },
  {
    "id": "rp-chem-02",
    "subject": "Chemistry",
    "rp": 2,
    "title": "Acid–alkali titration",
    "year": "Year 10",
    "course": "Separate only",
    "prompt": "Describe and evaluate a method for determining accurately the volume of sodium hydroxide solution needed to neutralise a measured volume of hydrochloric acid by titration.",
    "points": [
      "Use a pipette to transfer a fixed accurate volume of acid to a conical flask and add a few drops of suitable indicator.",
      "Rinse and fill a burette with sodium hydroxide, remove air bubbles and record the initial reading at eye level.",
      "Add alkali while swirling, then add dropwise near the end point until the indicator just changes colour.",
      "Record final burette reading and calculate the titre as the difference between final and initial readings.",
      "Repeat until concordant titres are obtained and calculate a mean excluding rough or anomalous titres.",
      "Explain why a white tile, dropwise addition near the end point and concordant repeats improve accuracy."
    ]
  },
  {
    "id": "rp-chem-03",
    "subject": "Chemistry",
    "rp": 3,
    "title": "Electrolysis of aqueous solutions",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation of the products formed when an aqueous ionic solution is electrolysed using inert electrodes.",
    "points": [
      "Set up inert electrodes in the chosen aqueous solution connected safely to a direct-current supply.",
      "State a hypothesis for which products will form at the cathode and anode based on the ions present.",
      "Collect or test products at each electrode using appropriate observations or gas tests such as hydrogen, oxygen or chlorine tests.",
      "Keep electrode material, solution concentration/volume, current conditions and time controlled when comparing solutions.",
      "Record observations systematically and repeat tests where necessary to confirm products.",
      "Link electrode products to ion movement/electron transfer and evaluate contamination, gas loss or subjective observations as limitations."
    ]
  },
  {
    "id": "rp-chem-04",
    "subject": "Chemistry",
    "rp": 4,
    "title": "Temperature changes in reactions",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into how one variable affects the temperature change in a reacting solution.",
    "points": [
      "Choose a defined independent variable such as concentration or reactant mass and measure reactant quantities accurately.",
      "Use an insulated cup with a lid where possible and measure the initial temperature before mixing.",
      "Mix reactants consistently, stir and record the maximum or minimum temperature reached.",
      "Keep other variables such as total volume, starting temperature, apparatus and reagent identity controlled.",
      "Repeat each condition, calculate mean temperature change and identify anomalies.",
      "Explain how insulation, rapid temperature measurement and extrapolation or improved probes could reduce energy-loss and measurement errors."
    ]
  },
  {
    "id": "rp-chem-05",
    "subject": "Chemistry",
    "rp": 5,
    "title": "Concentration and rate of reaction",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into how reactant concentration affects reaction rate using either gas production or a colour/turbidity change.",
    "points": [
      "Prepare a suitable range of concentrations while keeping the amount of the other reactant controlled.",
      "Measure rate using gas volume against time or a standardised colour/turbidity end point and start timing consistently.",
      "Keep temperature, apparatus, total solution volume and solid surface area controlled where relevant.",
      "Take enough time readings to calculate rate or determine an initial gradient rather than relying on one observation.",
      "Repeat each concentration, calculate means and identify anomalies.",
      "Plot an appropriate graph and explain limitations such as human end-point judgement, gas leaks or delayed timing."
    ]
  },
  {
    "id": "rp-chem-06",
    "subject": "Chemistry",
    "rp": 6,
    "title": "Paper chromatography",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Describe and evaluate a paper chromatography method used to separate and compare coloured substances, including how Rf values are obtained.",
    "points": [
      "Draw a pencil baseline and place small concentrated spots of samples on the line.",
      "Stand the paper in solvent with the solvent level below the baseline and keep the container covered where appropriate.",
      "Allow the solvent to rise, then remove the paper before the front reaches the top and mark the solvent front immediately.",
      "Measure distances from the baseline to the centre of each spot and to the solvent front.",
      "Calculate Rf = distance moved by substance ÷ distance moved by solvent and compare values only under the same conditions.",
      "Explain how small spots, pencil, repeat runs and consistent solvent/paper improve separation and reliability."
    ]
  },
  {
    "id": "rp-chem-07",
    "subject": "Chemistry",
    "rp": 7,
    "title": "Tests for ions",
    "year": "Year 11",
    "course": "Separate only",
    "prompt": "A student is given an unknown ionic compound. Describe a systematic practical strategy to identify its positive and negative ions and evaluate how reliable identification can be achieved.",
    "points": [
      "Use a clean sample and perform an appropriate flame test or hydroxide test for possible positive ions.",
      "Use acidified silver nitrate to test for halide ions, interpreting precipitate colours correctly.",
      "Use acidified barium solution for sulfate and dilute acid for carbonate where appropriate.",
      "Use separate fresh portions for tests so reagents from one test do not contaminate another.",
      "Compare observations with known standards or controls and repeat uncertain tests.",
      "Explain safety considerations and why combining more than one independent observation gives a more reliable identification."
    ]
  },
  {
    "id": "rp-chem-08",
    "subject": "Chemistry",
    "rp": 8,
    "title": "Analysis and purification of water",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation comparing water samples and producing a purified sample by distillation.",
    "points": [
      "Measure pH of each water sample using a consistent calibrated method.",
      "Measure dissolved solids by evaporating a known volume and determining the mass of residue, or another suitable quantitative method.",
      "Set up simple distillation so water vaporises, passes into a condenser and is collected separately.",
      "Use anti-bumping/safe heating and ensure the receiving apparatus is clean to avoid contamination.",
      "Repeat measurements or compare replicate samples and record volumes/masses with suitable precision.",
      "Explain that distillation removes many dissolved substances but purity should be checked and discuss energy cost or volatile contaminants as limitations."
    ]
  },
  {
    "id": "rp-phys-01",
    "subject": "Physics",
    "rp": 1,
    "title": "Specific heat capacity",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation to determine the specific heat capacity of a metal block.",
    "points": [
      "Measure the block mass and insert a heater and thermometer/temperature probe with good thermal contact.",
      "Measure initial temperature, potential difference and current, then heat for a measured time.",
      "Calculate energy supplied using E = VIt or measured electrical energy.",
      "Measure the temperature rise and calculate c = E ÷ (mΔθ).",
      "Repeat or collect multiple readings and plot energy transferred against temperature rise where appropriate.",
      "Reduce thermal losses using insulation and explain that energy lost to surroundings makes the calculated specific heat capacity less accurate."
    ]
  },
  {
    "id": "rp-phys-02",
    "subject": "Physics",
    "rp": 2,
    "title": "Thermal insulation",
    "year": "Year 10",
    "course": "Separate only",
    "prompt": "Plan and evaluate an investigation comparing the effectiveness of different materials as thermal insulators.",
    "points": [
      "Use identical containers with equal volumes/masses of water at the same starting temperature.",
      "Wrap each container with the same thickness or controlled amount of a different insulating material.",
      "Measure temperature at regular equal time intervals using the same thermometer or probes.",
      "Keep container shape, exposed surface area, lid arrangement, room conditions and timing controlled.",
      "Repeat each material and compare mean temperature drop or cooling rate.",
      "Explain how lids, draught shielding, equal thickness and automated probes reduce uncontrolled heat transfer and measurement error."
    ]
  },
  {
    "id": "rp-phys-03",
    "subject": "Physics",
    "rp": 3,
    "title": "Factors affecting resistance",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into how the length of a wire affects its electrical resistance.",
    "points": [
      "Set up a circuit with the test wire, ammeter in series and voltmeter across the measured wire length.",
      "Change wire length systematically while keeping material and cross-sectional area constant.",
      "Measure potential difference and current for each length and calculate resistance using R = V/I.",
      "Keep temperature as constant as possible by using low current or switching off between readings.",
      "Repeat measurements for each length and calculate means.",
      "Plot resistance against length and evaluate contact resistance, heating and measurement uncertainty."
    ]
  },
  {
    "id": "rp-phys-04",
    "subject": "Physics",
    "rp": 4,
    "title": "I–V characteristics",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Describe and evaluate a method for obtaining the current–potential-difference characteristics of a resistor, filament lamp and diode.",
    "points": [
      "Construct a circuit with an ammeter in series and voltmeter across the component, using a variable supply or variable resistor.",
      "Change potential difference in steps and record corresponding current for each component.",
      "Reverse the supply where appropriate to obtain negative values and the diode’s reverse behaviour safely.",
      "Allow the filament lamp to stabilise and avoid excessive current that may damage components.",
      "Plot current against potential difference using repeated or sufficiently numerous readings.",
      "Interpret the shapes and evaluate heating, meter resolution and contact resistance as sources of uncertainty."
    ]
  },
  {
    "id": "rp-phys-05",
    "subject": "Physics",
    "rp": 5,
    "title": "Density of solids and liquids",
    "year": "Year 10",
    "course": "Both",
    "prompt": "Describe and evaluate methods for determining the density of a regular solid, an irregular solid and a liquid.",
    "points": [
      "Measure mass with a balance for each sample.",
      "For a regular solid measure dimensions with suitable apparatus and calculate volume geometrically.",
      "For an irregular solid determine volume by water displacement, reading volume change carefully.",
      "For a liquid measure a known volume and find liquid mass by subtracting the empty-container mass.",
      "Calculate density using ρ = m/V with consistent SI or stated units.",
      "Repeat measurements where possible and discuss meniscus, trapped air, zero error and instrument-resolution uncertainties."
    ]
  },
  {
    "id": "rp-phys-06",
    "subject": "Physics",
    "rp": 6,
    "title": "Force and extension",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into the relationship between force and extension of a spring.",
    "points": [
      "Measure the spring’s original length and add known loads in steps, converting mass to force where necessary.",
      "Measure new length at each force and calculate extension = new length − original length.",
      "Keep the ruler fixed, read at eye level and allow oscillations to stop before recording.",
      "Do not exceed a safe load or stretch beyond the elastic limit unnecessarily.",
      "Repeat measurements and plot force against extension.",
      "Use the straight-line region to identify proportional behaviour or spring constant and evaluate parallax/zero-reading uncertainty."
    ]
  },
  {
    "id": "rp-phys-07",
    "subject": "Physics",
    "rp": 7,
    "title": "Force, mass and acceleration",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation of how resultant force affects the acceleration of a trolley of constant mass.",
    "points": [
      "Use a trolley on a low-friction track with a method such as a hanging mass to provide a measured driving force.",
      "Keep total moving mass constant while changing the distribution of mass to vary the driving force.",
      "Measure acceleration with light gates, motion sensor or repeated distance/time measurements.",
      "Keep track angle, friction conditions and starting procedure controlled.",
      "Repeat each force, calculate a mean acceleration and plot acceleration against force.",
      "Explain the expected proportional relationship and evaluate friction, pulley resistance and timing/sensor uncertainties."
    ]
  },
  {
    "id": "rp-phys-08",
    "subject": "Physics",
    "rp": 8,
    "title": "Wave speed, frequency and wavelength",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate measurements of wavelength, frequency and wave speed using a ripple tank or waves on a string.",
    "points": [
      "Generate steady waves at a measured or known frequency and allow a clear regular pattern to form.",
      "Measure several wavelengths across multiple wavefront spacings, then divide to reduce percentage uncertainty.",
      "Measure frequency from the signal generator or by timing a known number of oscillations.",
      "Calculate wave speed using v = fλ.",
      "Repeat measurements for each condition and use means where appropriate.",
      "Reduce parallax and timing errors, keep depth/tension controlled and explain why measuring multiple wavelengths improves precision."
    ]
  },
  {
    "id": "rp-phys-09",
    "subject": "Physics",
    "rp": 9,
    "title": "Reflection and refraction of light",
    "year": "Year 11",
    "course": "Separate only",
    "prompt": "Plan and evaluate an investigation of reflection and refraction of light using a ray box and transparent block.",
    "points": [
      "Draw a normal at the point where a narrow light ray meets the surface and mark the incident/reflected or refracted rays.",
      "Measure angles from the normal using a protractor, not from the surface.",
      "For reflection compare angle of incidence with angle of reflection over several incident angles.",
      "For refraction measure incident and refracted angles for several values while keeping the same material and face.",
      "Repeat or redraw carefully and use thin ray markings to reduce angular uncertainty.",
      "Evaluate block movement, ray width and protractor alignment as errors and state the observed reflection/refraction pattern."
    ]
  },
  {
    "id": "rp-phys-10",
    "subject": "Physics",
    "rp": 10,
    "title": "Infrared absorption and radiation",
    "year": "Year 11",
    "course": "Both",
    "prompt": "Plan and evaluate an investigation into how surface finish affects the absorption or emission of infrared radiation.",
    "points": [
      "Use identical containers or surfaces that differ only in colour/finish, such as matt black and shiny metal.",
      "For emission, fill with equal amounts of hot water at the same starting temperature; for absorption expose equally to the same infrared source.",
      "Measure temperature at regular equal time intervals with identical probes or thermometers.",
      "Keep surface area, distance from source, liquid volume/mass and surroundings controlled.",
      "Repeat trials and compare mean cooling/heating rates.",
      "Conclude which surface is the better absorber/emitter and evaluate convection, probe contact and unequal surface properties as limitations."
    ]
  }
];
const theorySeeds: TheorySeed[] = [
  {
    "id": "core-bio-01",
    "subject": "Biology",
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "topic": "Cell biology",
    "subTopic": "Surface area to volume ratio",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why large multicellular organisms need specialised exchange surfaces and transport systems.",
    "points": [
      "As an organism gets larger its surface-area-to-volume ratio decreases.",
      "Diffusion across the outer surface alone becomes too slow to meet cell demands.",
      "Specialised exchange surfaces provide a large surface area and short diffusion distance.",
      "Transport systems move substances between exchange surfaces and cells, maintaining concentration gradients."
    ]
  },
  {
    "id": "core-bio-02",
    "subject": "Biology",
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "topic": "Organisation",
    "subTopic": "Coronary heart disease and treatments",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Compare",
    "prompt": "Compare statins and stents as treatments for coronary heart disease.",
    "points": [
      "Statins are drugs that reduce blood cholesterol and can slow fatty-deposit formation.",
      "They may take time to reduce risk and can have side effects.",
      "Stents physically widen narrowed coronary arteries and improve blood flow quickly.",
      "Stent insertion is an invasive procedure and carries risks such as bleeding or clot formation."
    ]
  },
  {
    "id": "core-bio-03",
    "subject": "Biology",
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "topic": "Infection and response",
    "subTopic": "Monoclonal antibodies",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why monoclonal antibodies can be useful in diagnosis or treatment.",
    "points": [
      "Monoclonal antibodies are identical antibodies produced to bind to one specific antigen.",
      "Their specificity allows them to target particular molecules or cells.",
      "A marker or drug can be attached to the antibody for diagnosis or targeted treatment.",
      "Specific targeting can reduce effects on non-target cells compared with less selective treatments."
    ]
  },
  {
    "id": "core-bio-04",
    "subject": "Biology",
    "year": "Year 10",
    "unit": "Biology Paper 1",
    "topic": "Bioenergetics",
    "subTopic": "Exercise and oxygen debt",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why a person may continue breathing rapidly after vigorous exercise has stopped.",
    "points": [
      "During intense exercise oxygen supply may be insufficient for all muscle respiration.",
      "Some anaerobic respiration occurs and lactic acid accumulates.",
      "Extra oxygen is needed after exercise to help remove or oxidise lactic acid and restore normal conditions.",
      "Breathing and heart rate remain elevated temporarily to supply this oxygen and transport substances."
    ]
  },
  {
    "id": "core-bio-05",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Homeostasis and response",
    "subTopic": "Kidney and water balance",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how ADH helps maintain water balance when the blood becomes too concentrated.",
    "points": [
      "Receptors detect that blood water concentration is too low.",
      "More ADH is released by the pituitary gland.",
      "ADH makes kidney tubules/collecting ducts more permeable to water.",
      "More water is reabsorbed into the blood so a smaller volume of more concentrated urine is produced."
    ]
  },
  {
    "id": "core-bio-06",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Inheritance, variation and evolution",
    "subTopic": "DNA and protein synthesis",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how a change in DNA can sometimes change the function of a protein.",
    "points": [
      "The base sequence in DNA determines the order of amino acids in a protein.",
      "A mutation changes the DNA base sequence.",
      "This can change the amino-acid sequence and folding/shape of the protein.",
      "A changed shape can alter the protein’s active site or other function, although some mutations have no effect."
    ]
  },
  {
    "id": "core-bio-07",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Inheritance, variation and evolution",
    "subTopic": "Selective breeding",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Evaluate",
    "prompt": "Evaluate selective breeding as a way of producing farm animals with desired characteristics.",
    "points": [
      "Individuals with desired inherited characteristics are selected as parents.",
      "Repeated breeding can increase the frequency of desired alleles/traits.",
      "This can improve yield or another useful characteristic.",
      "Reduced genetic variation and inbreeding can increase inherited defects or vulnerability to disease.",
      "A justified conclusion should balance production benefits against welfare and genetic-diversity risks."
    ]
  },
  {
    "id": "core-bio-08",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Ecology",
    "subTopic": "Decomposition and environmental factors",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how temperature and oxygen availability affect the rate of decomposition.",
    "points": [
      "Decomposers use enzymes and respiration while breaking down material.",
      "Increasing temperature generally increases enzyme-controlled reaction rates up to an optimum.",
      "Very high temperatures can reduce activity by damaging enzymes or organisms.",
      "Oxygen allows efficient aerobic respiration, so low oxygen can reduce decomposition rate for many decomposers."
    ]
  },
  {
    "id": "core-bio-09",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Homeostasis and response",
    "subTopic": "Insulin and diabetes",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Compare",
    "prompt": "Compare type 1 and type 2 diabetes and their typical management.",
    "points": [
      "Type 1 diabetes involves little or no insulin production and is commonly treated with insulin.",
      "Type 2 diabetes involves body cells responding less effectively to insulin.",
      "Type 2 risk is associated with factors including obesity and may be managed using diet, exercise and medicines.",
      "Both conditions disrupt control of blood glucose and require monitoring/management."
    ]
  },
  {
    "id": "core-bio-10",
    "subject": "Biology",
    "year": "Year 11",
    "unit": "Biology Paper 2",
    "topic": "Ecology",
    "subTopic": "Trophic levels and biomass loss",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why only a small proportion of biomass from one trophic level becomes biomass at the next.",
    "points": [
      "Not all parts of organisms are eaten.",
      "Some ingested material is not digested and is lost in faeces.",
      "Biomass is used in respiration and energy is transferred to the surroundings as heat.",
      "Materials are also lost in waste products rather than becoming new biomass."
    ]
  },
  {
    "id": "core-chem-01",
    "subject": "Chemistry",
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "topic": "Atomic structure and the periodic table",
    "subTopic": "Relative atomic mass from isotopes",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Calculate",
    "prompt": "An element has 75% isotope-35 and 25% isotope-37. Calculate its relative atomic mass.",
    "points": [
      "Use a weighted mean: (35 × 75 + 37 × 25) ÷ 100.",
      "Calculate total weighted mass = 3550.",
      "Relative atomic mass = 35.5."
    ]
  },
  {
    "id": "core-chem-02",
    "subject": "Chemistry",
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "topic": "Bonding, structure and properties",
    "subTopic": "Nanoparticles",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Evaluate",
    "prompt": "Explain why nanoparticles can have useful properties but also create uncertainty when assessing risk.",
    "points": [
      "Nanoparticles have a very large surface area to volume ratio.",
      "This can make them effective catalysts or useful in small quantities.",
      "Their small size can allow them to enter tissues or environments in ways larger particles may not.",
      "Long-term effects may be uncertain, so benefits should be weighed against evidence about exposure and toxicity."
    ]
  },
  {
    "id": "core-chem-03",
    "subject": "Chemistry",
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "topic": "Quantitative chemistry",
    "subTopic": "Limiting reactants",
    "paper": "Paper 1",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain what is meant by a limiting reactant and why adding more of a reactant already in excess may not increase product yield.",
    "points": [
      "The limiting reactant is used up first in the reaction.",
      "When it is exhausted the reaction cannot make more product.",
      "Another reactant may remain in excess.",
      "Adding more of the excess reactant does not increase yield unless more limiting reactant is also available."
    ]
  },
  {
    "id": "core-chem-04",
    "subject": "Chemistry",
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "topic": "Chemical changes",
    "subTopic": "Half equations",
    "paper": "Paper 1",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain what happens to copper ions at the cathode during electrolysis and write the change in words or particle terms.",
    "points": [
      "Copper ions are positively charged and move toward the negative cathode.",
      "Each copper ion gains electrons.",
      "Reduction occurs because electrons are gained.",
      "Neutral copper atoms form and are deposited on the electrode."
    ]
  },
  {
    "id": "core-chem-05",
    "subject": "Chemistry",
    "year": "Year 10",
    "unit": "Chemistry Paper 1",
    "topic": "Energy changes",
    "subTopic": "Cells and batteries",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how changing the metals used in a simple chemical cell can change its potential difference.",
    "points": [
      "A chemical cell uses redox reactions between different materials.",
      "Different metals have different tendencies to lose electrons/react.",
      "A larger difference in reactivity can produce a larger potential difference.",
      "Potential difference also depends on conditions such as electrolyte and concentration."
    ]
  },
  {
    "id": "core-chem-06",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Rate and extent of chemical change",
    "subTopic": "Catalysts and activation energy",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why a catalyst increases reaction rate without changing the overall energy change of the reaction.",
    "points": [
      "A catalyst provides an alternative reaction pathway.",
      "The alternative pathway has a lower activation energy.",
      "A greater fraction of collisions can be successful at the same temperature.",
      "Reactant and product energy levels are unchanged, so the overall energy change is unchanged."
    ]
  },
  {
    "id": "core-chem-07",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Rate and extent of chemical change",
    "subTopic": "Equilibrium and pressure",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "For a gaseous reversible reaction, explain how increasing pressure can shift equilibrium when the two sides contain different total numbers of gas molecules.",
    "points": [
      "Increasing pressure disturbs the equilibrium.",
      "The system responds in the direction that reduces pressure.",
      "Equilibrium shifts toward the side with fewer gas molecules.",
      "If both sides have the same number of gas molecules, pressure change does not favour either side."
    ]
  },
  {
    "id": "core-chem-08",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Organic chemistry",
    "subTopic": "Alcohols and carboxylic acids",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Separate only",
    "commandWord": "Compare",
    "prompt": "Compare some reactions and properties of ethanol and ethanoic acid.",
    "points": [
      "Ethanol is an alcohol and can burn in oxygen.",
      "Ethanol can be oxidised to form ethanoic acid.",
      "Ethanoic acid is a carboxylic acid and reacts as an acid with bases/carbonates.",
      "Ethanoic acid reacts with alcohols to form esters under suitable conditions."
    ]
  },
  {
    "id": "core-chem-09",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Chemical analysis",
    "subTopic": "Flame emission spectroscopy",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Separate only",
    "commandWord": "Explain",
    "prompt": "Explain why instrumental methods such as flame emission spectroscopy can be useful compared with simple flame tests.",
    "points": [
      "Instrumental methods can identify elements from characteristic emission patterns.",
      "They can distinguish mixtures or ions that may give similar visual flame colours.",
      "They can be more sensitive and detect lower concentrations.",
      "They can provide quantitative information when calibrated."
    ]
  },
  {
    "id": "core-chem-10",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Chemistry of the atmosphere",
    "subTopic": "Carbon footprint",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Evaluate",
    "prompt": "Evaluate two strategies for reducing the carbon footprint of a product.",
    "points": [
      "Using renewable/low-carbon energy can reduce emissions during manufacture.",
      "Reducing material use, reusing products or recycling can reduce extraction and processing emissions.",
      "Shorter transport routes or efficient transport can reduce fuel use.",
      "Benefits should be compared with cost, practicality and any emissions shifted to another stage of the life cycle."
    ]
  },
  {
    "id": "core-chem-11",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Using resources",
    "subTopic": "Haber process trade-offs",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Separate only",
    "commandWord": "Evaluate",
    "prompt": "Explain why the conditions used in the Haber process are a compromise between equilibrium yield and reaction rate.",
    "points": [
      "Lower temperature gives a higher equilibrium yield of ammonia because the forward reaction is exothermic.",
      "Higher temperature gives a faster reaction rate.",
      "High pressure increases equilibrium yield because the product side has fewer gas molecules.",
      "Very high pressure is expensive and increases engineering/safety demands, so moderate high pressure and temperature are used with a catalyst."
    ]
  },
  {
    "id": "core-chem-12",
    "subject": "Chemistry",
    "year": "Year 11",
    "unit": "Chemistry Paper 2",
    "topic": "Using resources",
    "subTopic": "Corrosion prevention",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain two different ways iron can be protected from rusting.",
    "points": [
      "Barrier methods such as paint, oil or plastic prevent oxygen and water reaching the iron.",
      "Galvanising coats iron with zinc, which acts as a barrier.",
      "Zinc is more reactive than iron and can provide sacrificial protection if the coating is scratched.",
      "Protection works by preventing or diverting the oxidation of iron."
    ]
  },
  {
    "id": "core-phys-01",
    "subject": "Physics",
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "topic": "Energy",
    "subTopic": "Kinetic energy and braking",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Calculate",
    "prompt": "A 900 kg car travels at 20 m/s. Calculate its kinetic energy.",
    "points": [
      "Use Ek = 1/2 mv².",
      "Substitute 0.5 × 900 × 20².",
      "Calculate 180 000 J."
    ]
  },
  {
    "id": "core-phys-02",
    "subject": "Physics",
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "topic": "Electricity",
    "subTopic": "Series resistance",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Calculate",
    "prompt": "Two resistors of 4.0 Ω and 7.5 Ω are connected in series. Calculate the total resistance.",
    "points": [
      "For series components resistances add.",
      "Use 4.0 + 7.5.",
      "Total resistance = 11.5 Ω."
    ]
  },
  {
    "id": "core-phys-03",
    "subject": "Physics",
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "topic": "Particle model of matter",
    "subTopic": "Specific latent heat",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Calculate",
    "prompt": "0.50 kg of a substance melts at constant temperature after receiving 90 000 J. Calculate its specific latent heat of fusion.",
    "points": [
      "Use E = mL.",
      "Rearrange L = E/m.",
      "Calculate 90 000 ÷ 0.50 = 180 000 J/kg."
    ]
  },
  {
    "id": "core-phys-04",
    "subject": "Physics",
    "year": "Year 10",
    "unit": "Physics Paper 1",
    "topic": "Atomic structure",
    "subTopic": "Background radiation and risk",
    "paper": "Paper 1",
    "tier": "Both",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain why background-radiation count rate should be measured when investigating a radioactive source.",
    "points": [
      "A detector records radiation from the source plus background radiation.",
      "Background can vary with location and time.",
      "Measuring background allows it to be subtracted or considered when analysing source readings.",
      "This gives a better estimate of radiation from the source itself."
    ]
  },
  {
    "id": "core-phys-05",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Forces",
    "subTopic": "Momentum and safety",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how increasing the time taken for a passenger’s momentum to change in a collision can reduce the force on the passenger.",
    "points": [
      "The passenger’s momentum must change during the collision.",
      "Force is related to rate of change of momentum.",
      "For the same momentum change, increasing the stopping time reduces the rate of change.",
      "Features such as airbags or crumple zones increase stopping time and therefore reduce average force."
    ]
  },
  {
    "id": "core-phys-06",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Waves",
    "subTopic": "Ultrasound applications",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Separate only",
    "commandWord": "Explain",
    "prompt": "Explain how echoes of ultrasound can be used to locate a boundary inside a material or body.",
    "points": [
      "An ultrasound pulse is sent into the material.",
      "At a boundary some wave energy is reflected.",
      "The time delay for the echo to return is measured.",
      "Using wave speed and travel time allows the distance/depth of the boundary to be calculated."
    ]
  },
  {
    "id": "core-phys-07",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Magnetism and electromagnetism",
    "subTopic": "Generator effect",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Both",
    "commandWord": "Explain",
    "prompt": "Explain how moving a conductor in a magnetic field can produce a potential difference.",
    "points": [
      "The conductor cuts magnetic field lines or experiences changing magnetic flux linkage.",
      "A potential difference is induced across the conductor.",
      "A complete circuit allows an induced current to flow.",
      "Increasing speed, field strength or effective conductor length can increase the induced potential difference."
    ]
  },
  {
    "id": "core-phys-08",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Space physics",
    "subTopic": "Stellar evolution of massive stars",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Separate only",
    "commandWord": "Describe",
    "prompt": "Describe the later stages in the life cycle of a star much more massive than the Sun.",
    "points": [
      "After the main sequence the star expands into a red supergiant.",
      "Fusion produces progressively heavier elements up to iron in the core.",
      "The star undergoes a supernova explosion.",
      "The remaining core becomes a neutron star or, if massive enough, a black hole."
    ]
  },
  {
    "id": "core-phys-09",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Forces",
    "subTopic": "Pressure in fluids",
    "paper": "Paper 2",
    "tier": "Higher only",
    "course": "Separate only",
    "commandWord": "Explain",
    "prompt": "Explain why pressure in a liquid increases with depth.",
    "points": [
      "Liquid pressure is caused by the weight of liquid above a point.",
      "Greater depth means a taller column and therefore more liquid above.",
      "The greater weight produces a larger force per unit area.",
      "Therefore pressure increases with depth for a given liquid and gravitational field strength."
    ]
  },
  {
    "id": "core-phys-10",
    "subject": "Physics",
    "year": "Year 11",
    "unit": "Physics Paper 2",
    "topic": "Waves",
    "subTopic": "Lenses and images",
    "paper": "Paper 2",
    "tier": "Both",
    "course": "Separate only",
    "commandWord": "Compare",
    "prompt": "Compare a real image with a virtual image produced by lenses.",
    "points": [
      "A real image forms where light rays actually converge and can be projected onto a screen.",
      "A virtual image forms where rays only appear to come from a point and cannot be projected onto a screen.",
      "A converging lens can produce either type depending on object position.",
      "Image size and orientation depend on the lens and object distance."
    ]
  }
];

const practicalTopic = (subject: Subject) => `${subject} required practicals`;

function practicalQuestion(seed: PracticalSeed): Question {
  if (seed.points.length !== 6) throw new Error(`Required practical ${seed.id} must have exactly six marking points.`);
  return {
    id: seed.id,
    year: seed.year,
    unit: `${seed.subject} practical skills`,
    topic: practicalTopic(seed.subject),
    subTopic: `Required practical ${seed.rp}: ${seed.title}`,
    subject: seed.subject,
    paper: 'Across papers',
    course: seed.course,
    tier: 'Both',
    commandWord: 'Evaluate',
    commandWordDefinition: 'Describe a scientifically valid method, identify key controls and measurements, analyse how results should be processed, and evaluate limitations or improvements.',
    questionType: 'Extended 6-mark level-of-response',
    prompt: seed.prompt,
    maxMarks: 6,
    difficulty: 'Hard',
    hint: 'Include apparatus/method, variables, repeatability, data processing and a specific evaluation point.',
    template: '',
    requiredKeywords: seed.points.flatMap(point => point.toLowerCase().split(/\W+/).filter(word => word.length > 5)).slice(0, 12),
    markScheme: seed.points.map((point, index) => `[M${index + 1}] ${point}`),
    modelAnswer: seed.points.join(' '),
    pag: `AQA ${seed.subject} Required Practical ${seed.rp} – ${seed.title}`,
  };
}

function theoryQuestion(seed: TheorySeed): Question {
  const maxMarks = Math.min(6, Math.max(2, seed.points.length));
  return {
    id: seed.id,
    year: seed.year,
    unit: seed.unit,
    topic: seed.topic,
    subTopic: seed.subTopic,
    subject: seed.subject,
    paper: seed.paper,
    course: seed.course,
    tier: seed.tier,
    commandWord: seed.commandWord,
    commandWordDefinition: seed.commandWord === 'Calculate'
      ? 'Use mathematics to work out a numerical answer and show relevant working.'
      : seed.commandWord === 'Compare'
        ? 'Give linked similarities and differences using both items.'
        : seed.commandWord === 'Evaluate'
          ? 'Use evidence to consider strengths and limitations and reach a justified conclusion.'
          : 'Use scientific ideas to give clear linked statements.',
    questionType: seed.commandWord === 'Calculate'
      ? 'Short calculation'
      : seed.commandWord === 'Evaluate' && maxMarks >= 5
        ? 'Extended 6-mark level-of-response'
        : 'Short explanation',
    prompt: seed.prompt,
    maxMarks,
    difficulty: maxMarks >= 5 ? 'Hard' : maxMarks >= 4 ? 'Medium' : 'Easy',
    hint: '',
    template: '',
    requiredKeywords: seed.points.flatMap(point => point.toLowerCase().split(/\W+/).filter(word => word.length > 5)).slice(0, 10),
    markScheme: seed.points.map((point, index) => `[M${index + 1}] ${point}`),
    modelAnswer: seed.points.join(' '),
  };
}

export const practicalAndCoreExpansion: Question[] = [
  ...practicalSeeds.map(practicalQuestion),
  ...theorySeeds.map(theoryQuestion),
];

export const practicalExpansionAudit = {
  total: practicalAndCoreExpansion.length,
  practicals: practicalAndCoreExpansion.filter(question => Boolean(question.pag)).length,
  practicalSixMarkers: practicalAndCoreExpansion.filter(question => Boolean(question.pag) && question.maxMarks === 6).length,
  biology: practicalAndCoreExpansion.filter(question => question.subject === 'Biology').length,
  chemistry: practicalAndCoreExpansion.filter(question => question.subject === 'Chemistry').length,
  physics: practicalAndCoreExpansion.filter(question => question.subject === 'Physics').length,
};

if (practicalAndCoreExpansion.length !== 60) {
  throw new Error(`Practical/core expansion must contain exactly 60 questions; found ${practicalAndCoreExpansion.length}.`);
}
if (practicalExpansionAudit.practicals !== 28 || practicalExpansionAudit.practicalSixMarkers !== 28) {
  throw new Error('All 28 AQA Separate Science required-practical questions must be present and worth exactly 6 marks.');
}
if (practicalExpansionAudit.biology !== 20 || practicalExpansionAudit.chemistry !== 20 || practicalExpansionAudit.physics !== 20) {
  throw new Error('Practical/core expansion must contain exactly 20 questions per science.');
}
