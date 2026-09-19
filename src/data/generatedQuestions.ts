import type { PracticeQuestion } from './practiceQuestions';

const fmt = (value: number, digits = 3) => Number(value.toPrecision(digits)).toString();
const superscriptNumber = (value: number) => String(value).split('').map(character => ({ '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }[character] || character)).join('');
const sci = (value: number, digits = 3) => {
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e');
  return `${Number(mantissa)} × 10${superscriptNumber(Number(exponent))}`;
};

function common(
  id: string,
  year: 'Year 12' | 'Year 13',
  unit: string,
  topic: string,
  subTopic: string,
  commandWord: string,
  questionType: PracticeQuestion['questionType'],
  prompt: string,
  maxMarks: number,
  difficulty: PracticeQuestion['difficulty'],
  hint: string,
  requiredKeywords: string[],
  markScheme: string[],
  modelAnswer: string,
): PracticeQuestion {
  const commandWordDefinition = commandWord === 'Calculate'
    ? 'Use mathematics to solve a problem.'
    : commandWord === 'Describe'
      ? 'Give an account of the main features or method.'
      : 'Set out reasons or mechanisms using linked physics.';

  return {
    id,
    year,
    unit,
    topic,
    subTopic,
    commandWord,
    commandWordDefinition,
    questionType,
    prompt,
    maxMarks,
    difficulty,
    hint,
    template: '',
    requiredKeywords,
    markScheme,
    modelAnswer,
  };
}

function doubleSlit(id: string, i: number): PracticeQuestion {
  const lambdaNm = 450 + i * 40;
  const separationMm = 0.25 + i * 0.02;
  const distance = 1.8 + i * 0.2;
  const spacingM = (lambdaNm * 1e-9 * distance) / (separationMm * 1e-3);
  const spacingMm = spacingM * 1000;
  return common(
    id, 'Year 12', '3. Waves', 'Waves', 'Double-slit interference', 'Calculate', 'Short calculation',
    `Light of wavelength ${lambdaNm} nm passes through two slits separated by ${separationMm.toFixed(2)} mm. The screen is ${distance.toFixed(1)} m from the slits. Calculate the fringe spacing. State what happens to the fringe spacing if the screen distance is doubled.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use w = λD/s and convert to SI units first.',
    ['w=λD/s', 'SI units', 'fringe spacing', 'proportional to screen distance'],
    ['[C1] Uses w = λD/s.', '[C1] Converts wavelength and slit separation to SI units.', `[A1] Fringe spacing ≈ ${fmt(spacingMm)} mm.`, '[B1] States that doubling screen distance doubles fringe spacing.', '[B1] Links this to w being directly proportional to D.'],
    `w = λD/s = (${lambdaNm}×10⁻⁹ × ${distance.toFixed(1)})/(${separationMm.toFixed(2)}×10⁻³) = ${fmt(spacingM)} m = ${fmt(spacingMm)} mm. Doubling D doubles the fringe spacing because w is directly proportional to D.`,
  );
}

function stationaryWave(id: string, i: number): PracticeQuestion {
  const contexts = ['a stretched string', 'a microwave cavity', 'an air column', 'a vibrating wire', 'a resonance tube'];
  return common(
    id, 'Year 12', '3. Waves', 'Waves', 'Stationary waves', 'Explain', 'Extended 6-mark level-of-response',
    `Explain how a stationary wave can form in ${contexts[i]} and explain the physical meaning of nodes and antinodes.`,
    6, i >= 3 ? 'Hard' : 'Medium', 'Use superposition of waves travelling in opposite directions.',
    ['superposition', 'opposite directions', 'same frequency', 'nodes', 'antinodes', 'phase'],
    ['[B1] Identifies two waves of the same frequency travelling in opposite directions.', '[B1] States that the waves superpose.', '[B1] Explains destructive interference at nodes.', '[B1] Explains constructive interference at antinodes.', '[B1] States that node and antinode positions are fixed.', '[B1] Links the pattern to a fixed phase relationship between the two waves.'],
    'A wave reflects and overlaps with a wave of the same frequency travelling in the opposite direction. The two waves superpose. At fixed positions where they remain in antiphase, destructive interference gives nodes with zero or minimum amplitude. At positions where they remain in phase, constructive interference gives antinodes with maximum amplitude. Because the phase relationship at each position is fixed, the pattern does not travel.',
  );
}

function resultantForce(id: string, i: number): PracticeQuestion {
  const mass = 800 + i * 100;
  const drive = 3000 + i * 300;
  const resist = 800 + i * 100;
  const time = 4 + i;
  const initial = 5 + i;
  const acceleration = (drive - resist) / mass;
  const final = initial + acceleration * time;
  return common(
    id, 'Year 12', '4. Mechanics', 'Mechanics', 'Forces and motion', 'Calculate', 'Short calculation',
    `A ${mass} kg vehicle has a driving force of ${drive} N and a resistive force of ${resist} N. Calculate its acceleration. It is initially moving at ${initial} m s⁻¹. Calculate its speed after ${time} s, assuming the forces remain constant.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Find the resultant force, use F = ma, then v = u + at.',
    ['resultant force', 'F=ma', 'acceleration', 'v=u+at', 'constant force'],
    [`[C1] Resultant force = ${drive - resist} N.`, '[C1] Uses F = ma.', `[A1] Acceleration ≈ ${fmt(acceleration)} m s⁻².`, '[C1] Uses v = u + at.', `[A1] Final speed ≈ ${fmt(final)} m s⁻¹.`],
    `Resultant force = ${drive} − ${resist} = ${drive - resist} N. Therefore a = F/m = ${drive - resist}/${mass} = ${fmt(acceleration)} m s⁻². Then v = u + at = ${initial} + (${fmt(acceleration)}×${time}) = ${fmt(final)} m s⁻¹.`,
  );
}

function materialsExperiment(id: string, i: number): PracticeQuestion {
  const materials = ['steel', 'copper', 'nichrome', 'aluminium', 'brass'];
  return common(
    id, 'Year 12', '4. Mechanics', 'Materials', 'Young modulus practical', 'Describe', 'Extended 6-mark level-of-response',
    `Describe an experiment to determine the Young modulus of a ${materials[i]} wire. Include the measurements required and explain how you would reduce uncertainty.`,
    6, i >= 3 ? 'Hard' : 'Medium', 'You need original length, diameter, force and extension.',
    ['original length', 'diameter', 'cross-sectional area', 'force', 'extension', 'repeat'],
    ['[B1] Measures the original length of the wire.', '[B1] Measures diameter with a micrometer and calculates cross-sectional area.', '[B1] Applies known forces below the elastic limit.', '[B1] Measures extension for each force.', '[B1] Uses E = FL/(AΔL) or gradient of stress-strain graph.', '[B1] Gives justified uncertainty reduction, e.g. repeat diameter readings, use a long wire, avoid parallax.'],
    'Measure the original length L. Measure the diameter at several positions and orientations with a micrometer, average it and calculate A = πd²/4. Add known loads so F = mg and measure the extension ΔL, keeping within the elastic region. Calculate stress and strain or use E = FL/(AΔL). Repeat readings, use a long wire to make extension larger, and reduce parallax when measuring extension.',
  );
}

function potentialDivider(id: string, i: number): PracticeQuestion {
  const supply = 6 + i * 1.5;
  const r1 = 2 + i;
  const r2 = 3 + i * 0.5;
  const output = supply * r2 / (r1 + r2);
  return common(
    id, 'Year 12', '5. Electricity', 'Circuits', 'Potential divider', 'Calculate', 'Short calculation',
    `Two resistors of ${r1.toFixed(1)} kΩ and ${r2.toFixed(1)} kΩ are connected in series across a ${supply.toFixed(1)} V supply. Calculate the potential difference across the ${r2.toFixed(1)} kΩ resistor. Explain what happens to this output pd if that resistor increases in resistance while the other remains constant.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use the potential-divider ratio Vout = Vs × R2/(R1+R2).',
    ['potential divider', 'resistance ratio', 'output pd', 'series'],
    ['[C1] Uses the potential-divider equation.', '[C1] Uses the correct resistor in the numerator.', `[A1] Output pd ≈ ${fmt(output)} V.`, '[B1] States that increasing the output resistor increases its fraction of total resistance.', '[B1] Therefore the output pd increases.'],
    `Vout = VsR2/(R1+R2) = ${supply.toFixed(1)}×${r2.toFixed(1)}/(${r1.toFixed(1)}+${r2.toFixed(1)}) = ${fmt(output)} V. If R2 increases, it becomes a larger fraction of the total resistance, so a larger fraction of the supply pd appears across it and Vout increases.`,
  );
}

function internalResistance(id: string, i: number): PracticeQuestion {
  const emf = 1.5 + i * 0.1;
  const r = 0.2 + i * 0.05;
  const current = 0.8 + i * 0.1;
  const lost = current * r;
  const terminal = emf - lost;
  return common(
    id, 'Year 12', '5. Electricity', 'Circuits', 'Internal resistance', 'Calculate', 'Short calculation',
    `A cell has emf ${emf.toFixed(2)} V and internal resistance ${r.toFixed(2)} Ω. It supplies a current of ${current.toFixed(2)} A. Calculate the terminal potential difference and explain why terminal pd falls when current increases.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use V = ε − Ir.',
    ['emf', 'internal resistance', 'lost volts', 'terminal pd'],
    ['[C1] Uses V = ε − Ir.', `[C1] Lost volts Ir ≈ ${fmt(lost)} V.`, `[A1] Terminal pd ≈ ${fmt(terminal)} V.`, '[B1] Identifies Ir as the pd across the internal resistance.', '[B1] Explains that a larger current gives larger lost volts and lower terminal pd.'],
    `Lost volts = Ir = ${current.toFixed(2)}×${r.toFixed(2)} = ${fmt(lost)} V. Terminal pd V = ε − Ir = ${emf.toFixed(2)} − ${fmt(lost)} = ${fmt(terminal)} V. As current increases, Ir increases, so more of the emf is lost inside the cell and the terminal pd falls.`,
  );
}

function specificHeat(id: string, i: number): PracticeQuestion {
  const mass = 0.5 + i * 0.1;
  const power = 150 + i * 25;
  const time = 120 + i * 20;
  const rise = 10 + i * 2;
  const c = power * time / (mass * rise);
  return common(
    id, 'Year 13', '6. Further Mechanics', 'Thermal Physics', 'Specific heat capacity', 'Calculate', 'Short calculation',
    `A ${power} W heater warms a ${mass.toFixed(2)} kg block for ${time} s. Its temperature rises by ${rise} °C. Assuming all electrical energy heats the block, calculate its specific heat capacity. State one reason an experimental value may be too high or too low.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use Pt = mcΔθ.',
    ['Pt=mcΔθ', 'energy transfer', 'specific heat capacity', 'heat loss'],
    ['[C1] Uses E = Pt.', '[C1] Uses E = mcΔθ.', `[A1] c ≈ ${fmt(c)} J kg⁻¹ K⁻¹.`, '[B1] Identifies a realistic heat-transfer or measurement error.', '[B1] Explains the direction of its effect on the calculated value.'],
    `Electrical energy E = Pt = ${power}×${time} = ${power * time} J. Using E = mcΔθ, c = E/(mΔθ) = ${power * time}/(${mass.toFixed(2)}×${rise}) = ${fmt(c)} J kg⁻¹ K⁻¹. Heat loss to the surroundings would mean not all supplied energy heats the block, so using the full electrical energy would tend to overestimate c.`,
  );
}

function idealGas(id: string, i: number): PracticeQuestion {
  const n = 0.05 + i * 0.01;
  const temperature = 300 + i * 10;
  const volume = (1.2 + i * 0.1) * 1e-3;
  const pressure = n * 8.31 * temperature / volume;
  return common(
    id, 'Year 13', '6. Further Mechanics', 'Thermal Physics', 'Ideal gases', 'Calculate', 'Short calculation',
    `An ideal gas contains ${n.toFixed(2)} mol at ${temperature} K in a volume of ${(volume * 1e3).toFixed(1)} × 10⁻³ m³. Calculate the gas pressure. Explain microscopically why pressure rises if the gas is heated at constant volume.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use pV = nRT, then discuss molecular collisions.',
    ['pV=nRT', 'molecular speed', 'collisions', 'momentum change'],
    ['[C1] Uses pV = nRT.', '[C1] Rearranges correctly for pressure.', `[A1] p ≈ ${sci(pressure)} Pa.`, '[B1] Heating increases mean molecular kinetic energy/speed.', '[B1] More frequent and/or harder wall collisions increase rate of momentum transfer and pressure.'],
    `p = nRT/V = ${n.toFixed(2)}×8.31×${temperature}/${fmt(volume)} ≈ ${sci(pressure)} Pa. At constant volume, heating raises the molecules’ mean kinetic energy and speed. They collide with the walls more often and with larger momentum changes, increasing force per unit area and therefore pressure.`,
  );
}

function electricField(id: string, i: number): PracticeQuestion {
  const chargeNc = 2 + i;
  const radius = 0.10 + i * 0.02;
  const field = 8.99e9 * chargeNc * 1e-9 / (radius * radius);
  return common(
    id, 'Year 13', '7. Fields', 'Electric Fields', 'Point-charge fields', 'Calculate', 'Short calculation',
    `Calculate the electric field strength ${radius.toFixed(2)} m from a +${chargeNc.toFixed(1)} nC point charge. Use k = 8.99 × 10⁹ N m² C⁻². State the direction of the field at this point.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use E = kQ/r² and convert nC to C.',
    ['E=kQ/r²', 'inverse square', 'N C⁻¹', 'away from positive charge'],
    ['[C1] Uses E = kQ/r².', '[C1] Converts charge to coulombs.', `[A1] E ≈ ${sci(field)} N C⁻¹.`, '[B1] States that field direction is the direction of force on a positive test charge.', '[B1] Therefore the field points away from the positive source charge.'],
    `E = kQ/r² = 8.99×10⁹ × ${chargeNc.toFixed(1)}×10⁻⁹ / (${radius.toFixed(2)})² ≈ ${sci(field)} N C⁻¹. Electric field direction is defined by the force on a positive test charge, so it points away from the positive source charge.`,
  );
}

function induction(id: string, i: number): PracticeQuestion {
  const turns = 100 + i * 20;
  const flux = 0.006 + i * 0.001;
  const time = 0.03 + i * 0.005;
  const emf = turns * flux / time;
  return common(
    id, 'Year 13', '7. Fields', 'Electromagnetic Induction', 'Faraday law', 'Calculate', 'Short calculation',
    `A ${turns}-turn coil experiences a change in magnetic flux per turn of ${flux.toFixed(3)} Wb in ${time.toFixed(3)} s. Calculate the magnitude of the average induced emf. Explain one change that would increase the emf.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Use |ε| = NΔΦ/Δt.',
    ['Faraday law', 'flux linkage', 'rate of change', 'induced emf'],
    ['[C1] Uses |ε| = NΔΦ/Δt.', '[C1] Uses the change in flux per turn with the number of turns.', `[A1] Average emf ≈ ${fmt(emf)} V.`, '[B1] Gives a valid change such as more turns, larger flux change or shorter time.', '[B1] Links the change to a greater rate of change of flux linkage.'],
    `|ε| = NΔΦ/Δt = ${turns}×${flux.toFixed(3)}/${time.toFixed(3)} = ${fmt(emf)} V. Increasing the number of turns, increasing the flux change, or making the change happen in less time increases the rate of change of flux linkage and therefore the induced emf.`,
  );
}

function halfLife(id: string, i: number): PracticeQuestion {
  const sourceInitial = 800 + i * 160;
  const background = 20 + i * 5;
  const halfLives = 2 + (i % 3);
  const sourceFinal = sourceInitial / 2 ** halfLives;
  const measuredFinal = sourceFinal + background;
  const halfLifeHours = 2 + i;
  const elapsed = halfLifeHours * halfLives;
  return common(
    id, 'Year 13', '8. Nuclear Physics', 'Radioactivity', 'Half-life and background', 'Calculate', 'Short calculation',
    `A detector records ${sourceInitial + background} counts min⁻¹ from a source plus background. The background rate is ${background} counts min⁻¹ and the source half-life is ${halfLifeHours} h. Calculate the measured count rate after ${elapsed} h.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Subtract background first, apply the half-lives, then add background back.',
    ['background radiation', 'corrected count rate', 'half-life', 'measured count rate'],
    [`[C1] Source-only initial rate = ${sourceInitial} counts min⁻¹.`, `[C1] Identifies ${elapsed} h as ${halfLives} half-lives.`, `[C1] Source-only final rate = ${fmt(sourceFinal)} counts min⁻¹.`, `[A1] Measured final rate = ${fmt(measuredFinal)} counts min⁻¹.`, '[B1] Correctly distinguishes source count rate from background.'],
    `Subtract background first: source rate = ${sourceInitial + background} − ${background} = ${sourceInitial} counts min⁻¹. ${elapsed} h is ${halfLives} half-lives, so the source rate becomes ${sourceInitial}/2${superscriptNumber(halfLives)} = ${fmt(sourceFinal)} counts min⁻¹. Adding background back gives ${fmt(measuredFinal)} counts min⁻¹ measured rate.`,
  );
}

function bindingEnergy(id: string, i: number): PracticeQuestion {
  const defect = 0.010 + i * 0.002;
  const nucleons = 10 + i * 2;
  const binding = defect * 931.5;
  const perNucleon = binding / nucleons;
  return common(
    id, 'Year 13', '8. Nuclear Physics', 'Nuclear Physics', 'Binding energy', 'Calculate', 'Short calculation',
    `A nucleus has a mass defect of ${defect.toFixed(3)} u and contains ${nucleons} nucleons. Using 1 u = 931.5 MeV/c², calculate its total binding energy and binding energy per nucleon. State what binding energy per nucleon tells you about nuclear stability.`,
    5, i >= 3 ? 'Hard' : 'Medium', 'Multiply the mass defect by 931.5 MeV, then divide by nucleon number.',
    ['mass defect', 'binding energy', 'binding energy per nucleon', 'stability'],
    ['[C1] Uses E = Δmc² with 931.5 MeV per u.', `[A1] Total binding energy ≈ ${fmt(binding)} MeV.`, '[C1] Divides total binding energy by nucleon number.', `[A1] Binding energy per nucleon ≈ ${fmt(perNucleon)} MeV.`, '[B1] States that, in general, a larger binding energy per nucleon means a more tightly bound/more stable nucleus.'],
    `Total binding energy = ${defect.toFixed(3)}×931.5 = ${fmt(binding)} MeV. Binding energy per nucleon = ${fmt(binding)}/${nucleons} = ${fmt(perNucleon)} MeV. Binding energy per nucleon measures how tightly bound the nucleons are; a larger value generally indicates greater nuclear stability.`,
  );
}

const factories = [
  doubleSlit,
  stationaryWave,
  resultantForce,
  materialsExperiment,
  potentialDivider,
  internalResistance,
  specificHeat,
  idealGas,
  electricField,
  induction,
  halfLife,
  bindingEnergy,
];

export const generatedPracticeQuestions: PracticeQuestion[] = Array.from({ length: 60 }, (_, index) => {
  const factory = factories[index % factories.length];
  const variant = Math.floor(index / factories.length);
  return factory(`practice-${index + 41}`, variant);
});
