export type FormulaVariable = {
  symbol: string;
  name: string;
  unit?: string;
  meaning: string;
};

export type FormulaGuideItem = {
  id: string;
  latex: string;
  title: string;
  meaning: string;
  variables: FormulaVariable[];
  whenToUse: string;
  example: string;
  commonMistake: string;
  rearrangements?: string[];
};

export type FormulaGuideSection = {
  title: string;
  formulae: FormulaGuideItem[];
};

const v = (symbol: string, name: string, unit: string, meaning: string): FormulaVariable => ({ symbol, name, unit, meaning });
const f = (
  id: string,
  latex: string,
  title: string,
  meaning: string,
  variables: FormulaVariable[],
  whenToUse: string,
  example: string,
  commonMistake: string,
  rearrangements?: string[],
): FormulaGuideItem => ({ id, latex, title, meaning, variables, whenToUse, example, commonMistake, rearrangements });

export const equationGuideSections: FormulaGuideSection[] = [
  {
    title: 'Biology maths',
    formulae: [
      f('magnification','M=\\frac{I}{A}','Magnification','Magnification compares image size with actual size.',[v('M','magnification','','how many times larger the image is'),v('I','image size','same unit as A','measured image size'),v('A','actual size','same unit as I','real size of the object')],'Use for microscopy and scale-image questions.','48 mm image ÷ 0.12 mm actual size = ×400.','Convert both sizes to the same unit before dividing.',['I=MA','A=\\frac{I}{M}']),
      f('percentage-change','\\%\\ change=\\frac{final-initial}{initial}\\times100','Percentage change','Shows the size of a change relative to the starting value.',[v('initial','initial value','','starting measurement'),v('final','final value','','ending measurement')],'Use for osmosis, mass change, population change and experimental data.','5.0 g to 5.8 g: (0.8/5.0)×100 = 16%.','Divide by the original value, not the final value.'),
      f('surface-area-volume','SA:V=\\frac{surface\\ area}{volume}','Surface-area-to-volume ratio','Compares available surface with the amount of material inside.',[v('SA','surface area','e.g. cm^2','total external area'),v('V','volume','e.g. cm^3','space occupied')],'Use for exchange surfaces and cell-size questions.','Cube side 2 cm: SA=24 cm², V=8 cm³, ratio=3:1.','Calculate total surface area, not the area of one face.'),
      f('biomass-efficiency','efficiency=\\frac{biomass\\ transferred}{biomass\\ available}\\times100','Biomass transfer efficiency','Percentage of available biomass or energy transferred to the next trophic level.',[v('efficiency','efficiency','%','percentage transferred')],'Use in food-chain and trophic-level calculations.','240 kJ from 2000 kJ gives 12%.','Use the energy/biomass available at the previous level as the denominator.'),
    ],
  },
  {
    title: 'Chemistry maths',
    formulae: [
      f('moles','n=\\frac{m}{M_r}','Amount in moles','Mass divided by relative formula mass gives amount in moles.',[v('n','amount','mol','number of moles'),v('m','mass','g','mass of substance'),v('M_r','relative formula mass','','sum of relative atomic masses')],'Use in reacting-mass and mole-ratio questions.','9.0 g H₂O, Mr=18: n=9/18=0.50 mol.','Calculate Mr correctly before dividing.',['m=nM_r','M_r=\\frac{m}{n}']),
      f('mass-concentration','c=\\frac{m}{V}','Mass concentration','Mass of solute per volume of solution.',[v('c','concentration','g dm^{-3}','mass concentration'),v('m','mass of solute','g','solute mass'),v('V','solution volume','dm^3','total solution volume')],'Use when concentration is required in g/dm³.','12 g in 0.40 dm³ gives 30 g/dm³.','Convert cm³ to dm³ by dividing by 1000.'),
      f('molar-concentration','c=\\frac{n}{V}','Molar concentration','Amount of solute per volume of solution.',[v('c','concentration','mol dm^{-3}','molar concentration'),v('n','amount','mol','moles of solute'),v('V','volume','dm^3','solution volume')],'Higher-tier solution calculations.','0.20 mol in 0.50 dm³ gives 0.40 mol/dm³.','Volume must be in dm³.'),
      f('percentage-yield','yield=\\frac{actual}{theoretical}\\times100','Percentage yield','Compares product actually obtained with the maximum theoretical amount.',[v('actual','actual yield','g or mol','amount made'),v('theoretical','theoretical yield','same unit','maximum possible amount')],'Use after finding a theoretical yield.','8.0 g made from 10.0 g theoretical gives 80%.','Actual and theoretical values must use the same unit.'),
      f('atom-economy','atom\\ economy=\\frac{M_r\\ desired\\ product}{M_r\\ all\\ products}\\times100','Atom economy','Shows what fraction of product atoms end up in the desired product.',[v('M_r','relative formula mass','','formula mass from the balanced equation')],'Use to compare chemical processes and waste.','Desired product 68 out of 100 total product mass units gives 68%.','Use the balanced equation and include all products.'),
      f('reaction-rate','rate=\\frac{change\\ in\\ quantity}{time}','Mean reaction rate','How quickly a reactant is used or product forms.',[v('rate','rate','varies','change per unit time'),v('time','time','s','reaction time')],'Use with gas volume, mass or concentration changes.','72 cm³ in 40 s gives 1.8 cm³/s.','State the correct rate unit.'),
      f('rf','R_f=\\frac{distance\\ moved\\ by\\ substance}{distance\\ moved\\ by\\ solvent}','Chromatography Rf','Compares how far a substance travels with the solvent front.',[v('R_f','retention factor','','ratio between 0 and 1')],'Use for paper chromatography.','4.2 cm ÷ 7.0 cm = 0.60.','Measure both distances from the same start line.'),
    ],
  },
  {
    title: 'Physics · Energy, particles & matter',
    formulae: [
      f('kinetic','E_k=\\frac{1}{2}mv^2','Kinetic energy','Energy stored by a moving object.',[v('E_k','kinetic energy','J','energy of motion'),v('m','mass','kg','object mass'),v('v','speed','m s^{-1}','object speed')],'Use when mass and speed are known.','1200 kg at 15 m/s gives 135000 J.','Square the speed.'),
      f('gpe','E_p=mgh','Gravitational potential energy','Energy transferred when an object changes height.',[v('E_p','GPE change','J','energy change'),v('m','mass','kg','mass'),v('g','gravitational field strength','N kg^{-1}','about 9.8 near Earth'),v('h','height change','m','vertical height')],'Use for lifting/falling objects.','2 kg raised 3 m: about 58.8 J.','Use vertical height, not distance along a slope.'),
      f('elastic','E_e=\\frac{1}{2}ke^2','Elastic potential energy','Energy stored in an elastically stretched or compressed spring.',[v('E_e','elastic energy','J','stored energy'),v('k','spring constant','N m^{-1}','spring stiffness'),v('e','extension','m','change in length')],'Use within the elastic limit.','k=200 N/m, e=0.10 m gives 1.0 J.','Convert extension to metres and square it.'),
      f('power','P=\\frac{E}{t}','Power','Rate of energy transfer.',[v('P','power','W','joules per second'),v('E','energy transferred','J','energy'),v('t','time','s','time')],'Use whenever energy transfer and time are given.','600 J in 3 s gives 200 W.','Convert minutes to seconds.'),
      f('efficiency','efficiency=\\frac{useful\\ output}{total\\ input}','Efficiency','Fraction of input energy or power transferred usefully.',[v('efficiency','efficiency','fraction or %','useful proportion')],'Use with energy or power values.','80 J useful from 100 J input gives 0.80 or 80%.','Multiply by 100 only if a percentage is requested.'),
      f('density','\\rho=\\frac{m}{V}','Density','Mass per unit volume.',[v('\\rho','density','kg m^{-3} or g cm^{-3}','mass per volume'),v('m','mass','kg or g','mass'),v('V','volume','m^3 or cm^3','volume')],'Use for solids, liquids and gases.','540 g ÷ 60 cm³ = 9.0 g/cm³.','Keep mass and volume units compatible.'),
      f('shc','\\Delta E=mc\\Delta T','Specific heat capacity','Energy needed to change the temperature of a mass.',[v('\\Delta E','energy change','J','thermal energy transferred'),v('m','mass','kg','mass'),v('c','specific heat capacity','J kg^{-1} °C^{-1}','energy per kg per °C'),v('\\Delta T','temperature change','°C','final minus initial temperature')],'Use when temperature changes without a change of state.','2 kg, c=4200, ΔT=5 gives 42000 J.','Use the temperature change, not final temperature.'),
      f('latent','E=mL','Specific latent heat','Energy transferred during a change of state at constant temperature.',[v('E','energy','J','energy transferred'),v('m','mass','kg','mass'),v('L','specific latent heat','J kg^{-1}','energy per kg')],'Use for melting, freezing, boiling or condensing.','0.5 kg × 334000 J/kg = 167000 J.','Do not include a temperature change in a latent-heat step.'),
    ],
  },
  {
    title: 'Physics · Forces, electricity & waves',
    formulae: [
      f('speed','v=\\frac{s}{t}','Speed','Distance travelled per unit time.',[v('v','speed','m s^{-1}','speed'),v('s','distance','m','distance'),v('t','time','s','time')],'Use for uniform or average speed.','100 m in 20 s gives 5 m/s.','Use distance for speed; displacement is used with velocity.'),
      f('acceleration','a=\\frac{v-u}{t}','Acceleration','Change in velocity per unit time.',[v('a','acceleration','m s^{-2}','rate of velocity change'),v('v','final velocity','m s^{-1}','final velocity'),v('u','initial velocity','m s^{-1}','starting velocity'),v('t','time','s','time')],'Use when velocity changes.','0 to 12 m/s in 4 s gives 3 m/s².','Subtract initial velocity from final velocity.'),
      f('newton2','F=ma','Resultant force','A resultant force causes acceleration.',[v('F','resultant force','N','unbalanced force'),v('m','mass','kg','mass'),v('a','acceleration','m s^{-2}','acceleration')],'Use with Newton’s second law.','950 kg × 2.4 m/s² = 2280 N.','Use resultant force, not a single force unless it is the resultant.'),
      f('weight','W=mg','Weight','Gravitational force on a mass.',[v('W','weight','N','gravitational force'),v('m','mass','kg','mass'),v('g','gravitational field strength','N kg^{-1}','field strength')],'Use to convert mass to weight.','5 kg × 9.8 N/kg = 49 N.','Mass is in kg; weight is in N.'),
      f('work','E=Fs','Work done','Energy transferred when a force moves an object through a distance along the force.',[v('E','work/energy','J','energy transferred'),v('F','force','N','force'),v('s','distance','m','distance moved')],'Use when a force causes movement.','20 N through 5 m gives 100 J.','Use distance moved in the direction of the force.'),
      f('hooke','F=ke','Spring force','Force is proportional to extension for a spring within its limit of proportionality.',[v('F','force','N','spring force'),v('k','spring constant','N m^{-1}','stiffness'),v('e','extension','m','increase in length')],'Use within the linear region.','k=100 N/m, e=0.03 m gives 3 N.','Extension is change in length, not total length.'),
      f('momentum','p=mv','Momentum','Momentum depends on mass and velocity.',[v('p','momentum','kg m s^{-1}','momentum'),v('m','mass','kg','mass'),v('v','velocity','m s^{-1}','velocity')],'Use for collisions and momentum conservation.','2 kg at 4 m/s gives 8 kg m/s.','Momentum has direction.'),
      f('charge','Q=It','Charge flow','Charge transferred equals current multiplied by time.',[v('Q','charge','C','charge'),v('I','current','A','current'),v('t','time','s','time')],'Use in circuit charge calculations.','0.80 A for 45 s gives 36 C.','Time must be in seconds.'),
      f('ohm','V=IR','Potential difference, current and resistance','Relates p.d., current and resistance.',[v('V','potential difference','V','voltage'),v('I','current','A','current'),v('R','resistance','\\Omega','resistance')],'Use for component/circuit calculations.','2 A through 6 Ω gives 12 V.','Use values for the same component or section.'),
      f('electric-power','P=VI','Electrical power','Rate of electrical energy transfer.',[v('P','power','W','power'),v('V','potential difference','V','p.d.'),v('I','current','A','current')],'Use for electrical appliances and components.','12 V × 2 A = 24 W.','Do not confuse energy with power.'),
      f('electrical-energy','E=Pt','Electrical energy','Energy transferred equals power multiplied by time.',[v('E','energy','J','energy'),v('P','power','W','power'),v('t','time','s','time')],'Use for electrical energy transferred.','60 W for 10 s gives 600 J.','Use seconds when energy is required in joules.'),
      f('wave-speed','v=f\\lambda','Wave equation','Wave speed equals frequency multiplied by wavelength.',[v('v','wave speed','m s^{-1}','speed'),v('f','frequency','Hz','waves per second'),v('\\lambda','wavelength','m','wavelength')],'Use for sound, water and electromagnetic waves.','250 Hz × 1.6 m = 400 m/s.','Convert wavelength to metres.'),
      f('transformer','\\frac{V_p}{V_s}=\\frac{N_p}{N_s}','Transformer equation','Potential difference ratio equals turns ratio for an ideal transformer.',[v('V_p','primary p.d.','V','input p.d.'),v('V_s','secondary p.d.','V','output p.d.'),v('N_p','primary turns','','turns on primary'),v('N_s','secondary turns','','turns on secondary')],'Use for transformer calculations in GCSE Physics.', '230 V with 1200:60 turns gives 11.5 V secondary.','Keep primary and secondary values paired correctly.'),
    ],
  },
];

export const equationGuideCount = equationGuideSections.reduce((total, section) => total + section.formulae.length, 0);
