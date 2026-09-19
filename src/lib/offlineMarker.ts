type MarkPointEvidence = {
  scheme: string;
  words: string[];
  hits: string[];
  numericHit: boolean;
  equationHit: boolean;
  ratio: number;
  strong: boolean;
};

const STOP = new Set([
  'the','and','with','from','that','this','uses','use','using','correct','value','answer','mark','then',
  'therefore','into','when','where','which','would','could','should','their','there','than','each','some',
  'because','also','student','question','calculate','explain','describe','compare','evaluate','determine',
]);

const SYNONYM_GROUPS = [
  ['voltage','potential difference','pd','p.d.'],
  ['mean','average'],
  ['increase','increases','increased','higher','greater','rises','rise'],
  ['decrease','decreases','decreased','lower','smaller','falls','fall'],
  ['repeat','repeats','repeated','replicate','replicates'],
  ['accurate','accuracy'],
  ['precise','precision'],
  ['reliable','reliability','repeatable','repeatability'],
  ['independent variable','variable changed'],
  ['dependent variable','variable measured'],
  ['control variable','kept constant','controlled variable'],
  ['carbon dioxide','co2'],
  ['oxygen','o2'],
  ['water','h2o'],
  ['kinetic energy','energy in the kinetic store'],
  ['gravitational potential energy','energy in the gravitational potential store','gpe'],
  ['thermal energy','thermal store','energy in the thermal store'],
  ['current','rate of flow of charge'],
  ['resistance','opposition to current'],
];

function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/[×·]/g, ' x ')
    .replace(/[÷]/g, ' / ')
    .replace(/[−–—]/g, '-')
    .replace(/[²]/g, '2')
    .replace(/[³]/g, '3')
    .replace(/electromotive force/g, 'emf')
    .replace(/metres? per second/g, 'm s-1')
    .replace(/\s+/g, ' ')
    .trim();
}

function numbers(text: string) {
  return (text.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [])
    .map(Number)
    .filter(Number.isFinite);
}

function significantWords(text: string) {
  return (normalise(text).match(/[a-z][a-z0-9-]{3,}|\d+(?:\.\d+)?/g) || [])
    .filter(word => !STOP.has(word))
    .slice(0, 12);
}

function hasSynonym(answer: string, word: string) {
  if (answer.includes(word)) return true;
  const group = SYNONYM_GROUPS.find(items => items.includes(word));
  return group ? group.some(item => answer.includes(item)) : false;
}

function expectedEquations(text: string) {
  const compact = normalise(text).replace(/\s+/g, '');
  const equations = [
    ['f=ma', /f=ma|force=.*mass.*acceleration|mass.*acceleration/],
    ['v=ir', /v=ir|voltage=.*current.*resistance|current.*resistance/],
    ['p=vi', /p=vi|power=.*voltage.*current/],
    ['q=it', /q=it|charge=.*current.*time/],
    ['e=pt', /e=pt|energy=.*power.*time/],
    ['ek=0.5mv2', /0\.5.*mass.*speed|kinetic.*mass.*speed/],
    ['ep=mgh', /mgh|gravitational.*mass.*height/],
    ['density=m/v', /density=.*mass.*volume|mass.*\/.*volume/],
    ['v=fλ', /wave.*speed.*frequency.*wavelength|frequency.*wavelength/],
    ['w=fs', /work.*force.*distance|force.*distance/],
  ];
  return equations.filter(([, pattern]) => pattern.test(compact)).map(([name]) => name as string);
}

function equationEvidence(answer: string, scheme: string) {
  const expected = expectedEquations(scheme);
  if (!expected.length) return false;
  const combined = normalise(answer).replace(/\s+/g, '');
  return expected.some(name => {
    if (name === 'f=ma') return /f=ma|force=.*mass.*acceleration|mass.*x.*acceleration/.test(combined);
    if (name === 'v=ir') return /v=ir|voltage=.*current.*resistance|current.*x.*resistance/.test(combined);
    if (name === 'p=vi') return /p=vi|power=.*voltage.*current|voltage.*x.*current/.test(combined);
    if (name === 'q=it') return /q=it|charge=.*current.*time|current.*x.*time/.test(combined);
    if (name === 'e=pt') return /e=pt|energy=.*power.*time|power.*x.*time/.test(combined);
    if (name === 'ek=0.5mv2') return /0\.5.*mass.*speed|0\.5.*m.*v2|kinetic/.test(combined);
    if (name === 'ep=mgh') return /mgh|mass.*gravity.*height|gravitational/.test(combined);
    if (name === 'density=m/v') return /density=.*mass.*volume|mass.*\/.*volume/.test(combined);
    if (name === 'v=fλ') return /frequency.*wavelength|wave.*speed/.test(combined);
    if (name === 'w=fs') return /work.*force.*distance|force.*x.*distance/.test(combined);
    return false;
  });
}

function pointEvidence(answer: string, scheme: string): MarkPointEvidence {
  const clean = normalise(scheme.replace(/\[[^\]]+\]/g, ''));
  const words = significantWords(clean);
  const hits = words.filter(word => hasSynonym(answer, word));
  const expected = numbers(clean.replace(/x10/g, 'e'));
  const got = numbers(answer);
  const numericHit = expected.some(expectedValue =>
    got.some(actual => Math.abs(actual - expectedValue) <= Math.max(Math.abs(expectedValue) * 0.025, 0.01)),
  );
  const equationHit = equationEvidence(answer, clean);
  const ratio = words.length ? hits.length / words.length : 0;

  const causalNeeded = /because|therefore|causes?|leads? to|results? in|so that|due to/i.test(clean);
  const causalPresent = /because|therefore|so |so that|due to|causes?|leads? to|results? in|means that|hence/i.test(answer);
  const comparisonNeeded = /higher|lower|more|less|greater|smaller|whereas|compared|both/i.test(clean);
  const comparisonPresent = /whereas|compared|both|more|less|higher|lower|greater|smaller|than/i.test(answer);

  const strong =
    numericHit ||
    equationHit ||
    ratio >= 0.58 ||
    (ratio >= 0.42 && (!causalNeeded || causalPresent) && (!comparisonNeeded || comparisonPresent));

  return { scheme, words, hits, numericHit, equationHit, ratio, strong };
}

function commandWordAudit(commandWord: string, answer: string) {
  const command = normalise(commandWord);
  const checks: { satisfied: boolean; note: string }[] = [];

  if (/compare/.test(command)) {
    checks.push({
      satisfied: /whereas|compared|both|similar|different|more|less|higher|lower|than/i.test(answer),
      note: 'Make direct similarities/differences between both items rather than writing two separate descriptions.',
    });
  } else if (/evaluate/.test(command)) {
    const balance = /however|whereas|advantage|disadvantage|benefit|limitation|risk|against|on the other hand/i.test(answer);
    const judgement = /overall|therefore|so i would|on balance|best|better|more suitable|less suitable|conclude/i.test(answer);
    checks.push({ satisfied: balance && judgement, note: 'Use evidence for and against, then finish with a justified judgement.' });
  } else if (/explain|why/.test(command)) {
    checks.push({
      satisfied: /because|therefore|so |so that|due to|causes?|leads? to|results? in|means that|hence/i.test(answer),
      note: 'Link the science using cause → effect rather than listing isolated facts.',
    });
  } else if (/plan|design/.test(command)) {
    const method = /measure|record|change|vary|control|constant|repeat|mean|apparatus|equipment|range|interval/i.test(answer);
    const data = /graph|plot|mean|average|calculate|compare|table|results/i.test(answer);
    checks.push({ satisfied: method && data, note: 'Include what changes, what is measured, controls, repeats and how results are processed.' });
  } else if (/calculate|determine|show/.test(command)) {
    checks.push({
      satisfied: numbers(answer).length > 0,
      note: 'Show the relationship/equation, substitution, working and a final answer with unit where required.',
    });
  } else if (/use/.test(command)) {
    checks.push({
      satisfied: numbers(answer).length > 0 || /data|figure|table|graph|evidence/i.test(answer),
      note: 'Refer explicitly to the information or data supplied in the question.',
    });
  } else {
    checks.push({ satisfied: answer.trim().length > 2, note: 'Answer the exact command word directly and avoid irrelevant material.' });
  }

  return checks[0];
}

function unitAudit(answer: string, scheme: string[], isCalculation: boolean) {
  const audit: { issue: string; suggestion: string }[] = [];
  if (!isCalculation) return audit;

  if (!/=/.test(answer) && numbers(answer).length > 1) {
    audit.push({
      issue: 'Calculation working is difficult to follow.',
      suggestion: 'Write the equation, substitute values, then give the final answer.',
    });
  }

  const expectedUnit = scheme.join(' ').match(/\b(?:kg|g|m|cm|mm|s|min|h|n|j|kj|w|kw|pa|v|a|c|hz|ohm|Ω|mol|mol\/dm3|g\/dm3|kg\/m3|m\/s|m\/s2|j\/kg|j\/kg\s*°?c)\b/i)?.[0];
  if (expectedUnit && !normalise(answer).includes(normalise(expectedUnit))) {
    audit.push({
      issue: `Expected unit not clearly shown: ${expectedUnit}.`,
      suggestion: 'Include the correct unit with the final numerical answer.',
    });
  }
  return audit;
}

function contradictionFlags(answer: string) {
  const pairs = [
    ['current is used up', 'current is the same'],
    ['mass and weight are the same', 'weight is a force'],
    ['temperature is energy', 'temperature measures'],
    ['all radiation is equally penetrating', 'alpha'],
    ['antibiotics kill viruses', 'antibiotics'],
    ['plants only respire at night', 'respiration'],
  ];
  return pairs
    .filter(([wrong]) => answer.includes(wrong))
    .map(([wrong]) => `Possible misconception: “${wrong}”.`);
}

function structureScore(commandWord: string, answer: string) {
  const audit = commandWordAudit(commandWord, answer);
  const connectors = (answer.match(/because|therefore|however|whereas|so that|due to|leads? to|results? in|overall/gi) || []).length;
  const sentences = answer.split(/[.!?]+/).filter(part => part.trim().length > 5).length;
  return {
    satisfied: audit.satisfied,
    note: audit.note,
    score: Math.min(1, (audit.satisfied ? 0.55 : 0.15) + Math.min(0.3, connectors * 0.08) + Math.min(0.15, sentences * 0.03)),
  };
}

function levelOfResponse(maxMarks: number, creditedCount: number, structure: ReturnType<typeof structureScore>) {
  if (maxMarks !== 6) return { levelAwarded: 0, levelDescription: 'Not a six-mark level response', justification: 'Point-based marking used.' };
  const breadth = creditedCount / 6;
  let level = 0;
  if (creditedCount >= 1) level = 1;
  if (creditedCount >= 3 && structure.score >= 0.35) level = 2;
  if (creditedCount >= 5 && structure.satisfied && structure.score >= 0.65) level = 3;

  return {
    levelAwarded: level,
    levelDescription: level === 3 ? 'Level 3 (5–6)' : level === 2 ? 'Level 2 (3–4)' : level === 1 ? 'Level 1 (1–2)' : 'No creditable level',
    justification:
      level === 3
        ? 'Broad scientific coverage with a coherent response that satisfies the command word.'
        : level === 2
          ? 'Some developed science and logical links, but breadth, precision or command-word execution is incomplete.'
          : level === 1
            ? 'Some relevant science is present, but the response is limited, weakly linked or incomplete.'
            : 'Insufficient relevant scientific evidence for a level.',
  };
}

export function offlineMark(body: any) {
  const answer = normalise(String(body.studentAnswer || ''));
  const maxMarks = Math.max(0, Math.trunc(Number(body.maxMarks) || 0));
  const scheme = Array.isArray(body.markScheme) ? body.markScheme.map(String) : [];
  const commandWord = String(body.commandWord || 'None');
  const isCalculation =
    /calculate|determine|show/i.test(commandWord) ||
    scheme.some((point: string) => /\[(C|A)\d+\]/.test(point)) ||
    /equation|substitut|calculate/i.test(scheme.join(' '));

  const points = scheme.map((point: string) => pointEvidence(answer, point));
  const credited = points.filter(point => point.strong);
  const structure = structureScore(commandWord, answer);
  const contradictions = contradictionFlags(answer);
  const lor = levelOfResponse(maxMarks, credited.length, structure);

  let awarded = Math.min(maxMarks, credited.length);
  if (maxMarks === 6) {
    if (lor.levelAwarded === 1) awarded = Math.min(2, Math.max(1, credited.length));
    if (lor.levelAwarded === 2) awarded = Math.min(4, Math.max(3, credited.length));
    if (lor.levelAwarded === 3) awarded = Math.min(6, Math.max(5, credited.length));
    if (lor.levelAwarded === 0) awarded = 0;
  }

  if (isCalculation && numbers(answer).length === 0) awarded = Math.min(awarded, Math.max(0, maxMarks - 2));
  if (contradictions.length) awarded = Math.max(0, awarded - Math.min(1, contradictions.length));

  const coverage = scheme.length ? credited.length / scheme.length : 0;
  const confidence = Math.max(
    30,
    Math.min(
      94,
      Math.round(
        42 +
        coverage * 38 +
        structure.score * 12 +
        (isCalculation && numbers(answer).length ? 5 : 0) -
        contradictions.length * 8 -
        (maxMarks === 6 ? 4 : 0),
      ),
    ),
  );

  const missing = points.filter(point => !point.strong);
  const units = unitAudit(answer, scheme, isCalculation);
  const presentKeywords = Array.from(new Set(credited.flatMap(point => point.hits))).slice(0, 16);
  const missingKeywords = Array.from(new Set(missing.flatMap(point => point.words))).slice(0, 16);

  return {
    marksAwarded: awarded,
    totalMarks: maxMarks,
    commandWordCheck: {
      commandWord,
      satisfied: structure.satisfied,
      examinerNotes: structure.satisfied
        ? `The response broadly follows the “${commandWord}” demand. ${structure.note}`
        : `Command-word issue: ${structure.note}`,
    },
    keywordAnalysis: {
      presentKeywords,
      missingKeywords,
      laymanTermsUsed: [],
    },
    creditedPoints: credited.slice(0, maxMarks).map((point, index) => ({
      mark: point.scheme.match(/\[[^\]]+\]/)?.[0] || `Point ${index + 1}`,
      studentEvidence: point.numericHit
        ? 'A numerical value matches an expected result within tolerance.'
        : point.equationHit
          ? 'The required equation or scientific relationship is shown.'
          : point.hits.length
            ? `Matched scientific evidence: ${point.hits.join(', ')}.`
            : 'Equivalent scientific evidence detected.',
    })),
    lostMarksAnalysis: missing.slice(0, Math.max(0, maxMarks - awarded)).map(point => ({
      reason: `Insufficient evidence for: ${point.scheme.replace(/^\[[^\]]+\]\s*/, '')}`,
      improvementSuggestion:
        /explain/i.test(commandWord)
          ? 'Add the missing scientific point and link it with cause → effect.'
          : /compare/i.test(commandWord)
            ? 'Make a direct comparison using both items in the same statement.'
            : /evaluate/i.test(commandWord)
              ? 'Add evidence on the other side and finish with a justified judgement.'
              : /plan|design/i.test(commandWord)
                ? 'Add the missing method detail, variable/control, measurement, repeat or data-processing step.'
                : 'State the complete scientific relationship or calculation step explicitly.',
    })),
    lorRubric: lor,
    sigFigUnitAudit: units,
    misconceptions: contradictions,
    inDepthAnalysis: {
      physicsPrinciples: 'Offline examiner checks explicit mark-scheme evidence, accepted terminology, numerical agreement and common GCSE Science misconceptions.',
      stepByStepReasoning: isCalculation
        ? 'Equation/method evidence, numerical working, final value and units are checked separately where the mark scheme allows.'
        : 'Each supplied marking point is checked for explicit or equivalent scientific evidence, then the command word and overall structure are reviewed.',
      structureAndClarity:
        maxMarks === 6
          ? `${lor.levelDescription}. ${lor.justification}`
          : structure.satisfied
            ? 'The answer structure broadly matches the command word.'
            : structure.note,
    },
    officialMarkScheme: scheme,
    modelAnswer: body.modelAnswer || '',
    examinerConfidence: confidence,
    confidenceReason:
      confidence >= 80
        ? 'Strong explicit evidence matched the mark scheme and the command-word structure was clear.'
        : confidence >= 65
          ? 'Several marking points were clear, but some wording, structure or calculation evidence remained ambiguous.'
          : 'The response has limited or ambiguous evidence; AI or teacher review is recommended.',
    reviewRecommended: confidence < 70 || maxMarks === 6,
  };
}
