type MarkPointEvidence = {
  scheme: string;
  markCode: string;
  words: string[];
  hits: string[];
  numericHit: boolean;
  equationHit: boolean;
  unitRequired: boolean;
  unitHit: boolean;
  causalNeeded: boolean;
  causalPresent: boolean;
  comparisonNeeded: boolean;
  comparisonPresent: boolean;
  ratio: number;
  borderline: boolean;
  strong: boolean;
};

const STOP = new Set([
  'the','and','with','from','that','this','uses','use','using','correct','value','answer','mark','then',
  'therefore','into','when','where','which','would','could','should','their','there','than','each','some',
  'because','also','student','question','calculate','explain','describe','compare','evaluate','determine',
  'allow','accept','ignore','award','credit','idea','statement','response','one','two','three',
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
  ['current','rate of flow of charge','rate of charge flow'],
  ['resistance','opposition to current'],
  ['resultant force','net force'],
  ['acceleration','rate of change of velocity'],
  ['momentum','mass times velocity','mass x velocity'],
  ['frequency','waves per second','oscillations per second'],
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
    .replace(/newtons?/g, 'n')
    .replace(/joules?/g, 'j')
    .replace(/watts?/g, 'w')
    .replace(/volts?/g, 'v')
    .replace(/amperes?|amps?/g, 'a')
    .replace(/hertz/g, 'hz')
    .replace(/ohms?/g, 'ohm')
    .replace(/metres? per second squared/g, 'm/s2')
    .replace(/metres? per second/g, 'm/s')
    .replace(/\s+/g, ' ')
    .trim();
}

function numericValues(text: string) {
  const clean = normalise(text);
  const values: number[] = [];
  const scientific = /([-+]?\d*\.?\d+)\s*x\s*10\s*\^?\s*([-+]?\d+)/gi;
  let match: RegExpExecArray | null;
  while ((match = scientific.exec(clean))) {
    const base = Number(match[1]);
    const exponent = Number(match[2]);
    const value = base * 10 ** exponent;
    if (Number.isFinite(value)) values.push(value);
  }

  const stripped = clean.replace(scientific, ' ');
  for (const raw of stripped.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []) {
    const value = Number(raw);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

function significantWords(text: string) {
  return (normalise(text).match(/[a-z][a-z0-9-]{2,}|\d+(?:\.\d+)?/g) || [])
    .filter(word => !STOP.has(word))
    .slice(0, 16);
}

function hasSynonym(answer: string, word: string) {
  if (answer.includes(word)) return true;
  const group = SYNONYM_GROUPS.find(items => items.includes(word));
  return group ? group.some(item => answer.includes(item)) : false;
}

function expectedEquations(text: string) {
  const compact = normalise(text).replace(/\s+/g, '');
  const equations: Array<[string, RegExp]> = [
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
    ['p=f/a', /pressure=.*force.*area|force.*\/.*area/],
    ['momentum=mv', /momentum=.*mass.*velocity|mass.*velocity/],
  ];
  return equations.filter(([, pattern]) => pattern.test(compact)).map(([name]) => name);
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
    if (name === 'ek=0.5mv2') return /0\.5.*mass.*speed|0\.5.*m.*v2|kinetic.*energy/.test(combined);
    if (name === 'ep=mgh') return /mgh|mass.*gravity.*height|gravitational.*potential/.test(combined);
    if (name === 'density=m/v') return /density=.*mass.*volume|mass.*\/.*volume/.test(combined);
    if (name === 'v=fλ') return /frequency.*wavelength|wave.*speed/.test(combined);
    if (name === 'w=fs') return /work.*force.*distance|force.*x.*distance/.test(combined);
    if (name === 'p=f/a') return /pressure=.*force.*area|force.*\/.*area/.test(combined);
    if (name === 'momentum=mv') return /momentum=.*mass.*velocity|mass.*x.*velocity/.test(combined);
    return false;
  });
}

function extractUnit(text: string) {
  return normalise(text).match(/\b(?:kg|g|m|cm|mm|s|min|h|n|j|kj|w|kw|pa|kpa|v|mv|a|ma|c|hz|khz|ohm|mol|mol\/dm3|g\/dm3|kg\/m3|m\/s|m\/s2|j\/kg|j\/kg\s*°?c)\b/i)?.[0] || '';
}

function pointEvidence(answer: string, scheme: string): MarkPointEvidence {
  const markCode = scheme.match(/\[([A-Z]\d+)\]/i)?.[1]?.toUpperCase() || '';
  const clean = normalise(scheme.replace(/\[[^\]]+\]/g, ''));
  const words = significantWords(clean);
  const hits = words.filter(word => hasSynonym(answer, word));
  const expected = numericValues(clean.replace(/x10/g, ' x 10'));
  const got = numericValues(answer);
  const numericHit = expected.some(expectedValue =>
    got.some(actual => Math.abs(actual - expectedValue) <= Math.max(Math.abs(expectedValue) * 0.025, 0.01)),
  );
  const equationHit = equationEvidence(answer, clean);
  const ratio = words.length ? hits.length / words.length : 0;
  const unit = extractUnit(clean);
  const unitRequired = /\bunit\b|including (?:the )?unit|with (?:the )?unit/i.test(clean);
  const unitHit = !unit || normalise(answer).includes(unit);

  const causalNeeded = /because|therefore|causes?|leads? to|results? in|so that|due to/i.test(clean);
  const causalPresent = /because|therefore|so |so that|due to|causes?|leads? to|results? in|means that|hence/i.test(answer);
  const comparisonNeeded = /higher|lower|more|less|greater|smaller|whereas|compared|both/i.test(clean);
  const comparisonPresent = /whereas|compared|both|more|less|higher|lower|greater|smaller|than/i.test(answer);

  let strong = false;
  if (/^[MA]\d+$/.test(markCode) && expected.length) {
    strong = markCode.startsWith('M')
      ? equationHit || (ratio >= 0.42 && got.length >= 2)
      : numericHit;
  } else if (/^M\d+$/.test(markCode)) {
    strong = equationHit || ratio >= 0.5;
  } else if (/^A\d+$/.test(markCode)) {
    strong = expected.length ? numericHit : ratio >= 0.58;
  } else {
    strong =
      numericHit ||
      equationHit ||
      ratio >= 0.62 ||
      (ratio >= 0.46 && (!causalNeeded || causalPresent) && (!comparisonNeeded || comparisonPresent));
  }

  if (unitRequired && !unitHit) strong = false;
  if (causalNeeded && ratio < 0.62 && !causalPresent) strong = false;
  if (comparisonNeeded && ratio < 0.62 && !comparisonPresent) strong = false;

  const borderline = !strong && (
    ratio >= 0.34 ||
    (expected.length > 0 && got.length > 0) ||
    (expectedEquations(clean).length > 0 && /[=x/]/.test(answer))
  );

  return {
    scheme,
    markCode,
    words,
    hits,
    numericHit,
    equationHit,
    unitRequired,
    unitHit,
    causalNeeded,
    causalPresent,
    comparisonNeeded,
    comparisonPresent,
    ratio,
    borderline,
    strong,
  };
}

function isLikelyCalculation(commandWord: string, scheme: string[], questionType: string) {
  if (questionType === 'Short calculation') return true;
  if (/calculate|show that/i.test(commandWord)) return true;
  return scheme.some(point => /\[(M|A|C)\d+\]/i.test(point)) || /equation|substitut|calculation|working/i.test(scheme.join(' '));
}

function commandWordAudit(commandWord: string, answer: string, isCalculation: boolean) {
  const command = normalise(commandWord);

  if (/compare/.test(command)) {
    return {
      satisfied: /whereas|compared|both|similar|different|more|less|higher|lower|than/i.test(answer),
      note: 'Make direct similarities/differences between both items rather than writing two separate descriptions.',
    };
  }
  if (/evaluate/.test(command)) {
    const balance = /however|whereas|advantage|disadvantage|benefit|limitation|risk|against|on the other hand/i.test(answer);
    const judgement = /overall|therefore|on balance|best|better|more suitable|less suitable|conclude|recommend/i.test(answer);
    return { satisfied: balance && judgement, note: 'Use relevant evidence on more than one side, then finish with a justified judgement.' };
  }
  if (/explain|why/.test(command)) {
    return {
      satisfied: /because|therefore|so |so that|due to|causes?|leads? to|results? in|means that|hence/i.test(answer),
      note: 'Link the science using cause → effect rather than listing isolated facts.',
    };
  }
  if (/plan|design/.test(command)) {
    const method = /measure|record|change|vary|control|constant|repeat|mean|apparatus|equipment|range|interval/i.test(answer);
    const data = /graph|plot|mean|average|calculate|compare|table|results/i.test(answer);
    return { satisfied: method && data, note: 'Include what changes, what is measured, controls, repeats and how results are processed.' };
  }
  if (/calculate|show/.test(command) || (/determine/.test(command) && isCalculation)) {
    return {
      satisfied: numericValues(answer).length > 0,
      note: 'Show the relationship/equation, substitution, working and a final answer with unit where required.',
    };
  }
  if (/use/.test(command)) {
    return {
      satisfied: numericValues(answer).length > 0 || /data|figure|table|graph|evidence/i.test(answer),
      note: 'Refer explicitly to the information or data supplied in the question.',
    };
  }
  return {
    satisfied: answer.trim().length > 2,
    note: 'Answer the exact command word directly and avoid irrelevant material.',
  };
}

function unitAudit(answer: string, scheme: string[], isCalculation: boolean) {
  const audit: { issue: string; suggestion: string }[] = [];
  if (!isCalculation) return audit;

  if (!/=/.test(answer) && numericValues(answer).length > 1) {
    audit.push({
      issue: 'Calculation working is difficult to follow.',
      suggestion: 'Write the equation, substitute values, then give the final answer.',
    });
  }

  const explicitUnitPoint = scheme.find(point => /\bunit\b|including (?:the )?unit|with (?:the )?unit/i.test(point));
  const expectedUnit = extractUnit(explicitUnitPoint || scheme.join(' '));
  if (explicitUnitPoint && expectedUnit && !normalise(answer).includes(expectedUnit)) {
    audit.push({
      issue: `Expected unit not clearly shown: ${expectedUnit}.`,
      suggestion: 'Include the correct unit with the final numerical answer.',
    });
  }
  return audit;
}

function contradictionFlags(answer: string) {
  const wrongClaims = [
    'current is used up',
    'mass and weight are the same',
    'temperature is energy',
    'all radiation is equally penetrating',
    'antibiotics kill viruses',
    'plants only respire at night',
    'energy is used up',
    'electrons move from positive to negative',
  ];
  return wrongClaims
    .filter(wrong => answer.includes(wrong))
    .map(wrong => `Possible misconception: “${wrong}”.`);
}

function structureScore(commandWord: string, answer: string, isCalculation: boolean) {
  const audit = commandWordAudit(commandWord, answer, isCalculation);
  const connectors = (answer.match(/because|therefore|however|whereas|so that|due to|leads? to|results? in|overall/gi) || []).length;
  const sentences = answer.split(/[.!?]+/).filter(part => part.trim().length > 5).length;
  return {
    satisfied: audit.satisfied,
    note: audit.note,
    score: Math.min(1, (audit.satisfied ? 0.55 : 0.15) + Math.min(0.3, connectors * 0.08) + Math.min(0.15, sentences * 0.03)),
  };
}

function levelOfResponse(
  questionType: string,
  maxMarks: number,
  creditedCount: number,
  schemeCount: number,
  structure: ReturnType<typeof structureScore>,
) {
  const isLor = questionType === 'Extended 6-mark level-of-response' && maxMarks === 6;
  if (!isLor) {
    return {
      levelAwarded: 0,
      levelDescription: 'Point-based marking',
      justification: 'This question is not identified as a six-mark level-of-response item.',
    };
  }

  const coverage = schemeCount ? creditedCount / schemeCount : 0;
  let level = 0;
  if (creditedCount >= 1 || coverage >= 0.15) level = 1;
  if (coverage >= 0.4 && structure.score >= 0.35) level = 2;
  if (coverage >= 0.72 && structure.satisfied && structure.score >= 0.62) level = 3;

  let mark = 0;
  if (level === 1) mark = coverage >= 0.3 || structure.score >= 0.3 ? 2 : 1;
  if (level === 2) mark = coverage >= 0.6 || structure.score >= 0.55 ? 4 : 3;
  if (level === 3) mark = coverage >= 0.9 && structure.score >= 0.8 ? 6 : 5;

  return {
    levelAwarded: level,
    suggestedMark: mark,
    levelDescription: level === 3 ? 'Level 3 (5–6)' : level === 2 ? 'Level 2 (3–4)' : level === 1 ? 'Level 1 (1–2)' : 'No creditable level',
    justification:
      level === 3
        ? 'Broad, mostly accurate scientific coverage with coherent links and a response that satisfies the command word.'
        : level === 2
          ? 'Some developed relevant science is present, but breadth, precision or logical development is incomplete.'
          : level === 1
            ? 'Some relevant science is present, but the response is limited, weakly linked or incomplete.'
            : 'Insufficient relevant scientific evidence for a level.',
  };
}

export function offlineMark(body: any) {
  const answer = normalise(String(body.studentAnswer || ''));
  const maxMarks = Math.max(0, Math.trunc(Number(body.maxMarks) || 0));
  const scheme: string[] = Array.isArray(body.markScheme) ? body.markScheme.map(String) : [];
  const commandWord = String(body.commandWord || 'None');
  const questionType = String(body.questionType || '');
  const subject = String(body.subject || 'Science');
  const isCalculation = isLikelyCalculation(commandWord, scheme, questionType);

  const points: MarkPointEvidence[] = scheme.map(point => pointEvidence(answer, point));
  const credited = points.filter(point => point.strong);
  const missing = points.filter(point => !point.strong);
  const borderline = points.filter(point => point.borderline);
  const structure = structureScore(commandWord, answer, isCalculation);
  const contradictions = contradictionFlags(answer);
  const lor = levelOfResponse(questionType, maxMarks, credited.length, scheme.length, structure);

  let awarded = Math.min(maxMarks, credited.length);
  if (questionType === 'Extended 6-mark level-of-response' && maxMarks === 6) {
    awarded = Math.max(0, Math.min(6, Number((lor as any).suggestedMark) || 0));
  }

  // A blank numerical response cannot earn accuracy-only marks, but valid method evidence can still earn method credit.
  if (isCalculation && numericValues(answer).length === 0) {
    const methodCredits = credited.filter(point => /^M\d+$/.test(point.markCode) || point.equationHit).length;
    awarded = Math.min(awarded, methodCredits);
  }

  const coverage = scheme.length ? credited.length / scheme.length : 0;
  const ambiguityPenalty = Math.min(18, borderline.length * 5);
  const contradictionPenalty = Math.min(16, contradictions.length * 8);
  const lorPenalty = questionType === 'Extended 6-mark level-of-response' ? 7 : 0;
  const confidence = Math.max(
    28,
    Math.min(
      96,
      Math.round(
        45 +
        coverage * 38 +
        structure.score * 10 +
        (isCalculation && numericValues(answer).length ? 5 : 0) -
        ambiguityPenalty -
        contradictionPenalty -
        lorPenalty,
      ),
    ),
  );

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
      mark: point.markCode ? `[${point.markCode}]` : `Point ${index + 1}`,
      studentEvidence: point.numericHit
        ? 'A numerical result matches the expected value within tolerance.'
        : point.equationHit
          ? 'The required equation or scientific relationship is shown.'
          : point.hits.length
            ? `Matched scientific evidence: ${point.hits.join(', ')}.`
            : 'Equivalent scientific evidence detected.',
    })),
    lostMarksAnalysis: missing.slice(0, Math.max(0, maxMarks - awarded)).map(point => ({
      reason: point.borderline
        ? `Some relevant evidence was detected, but it was not clear enough to credit safely for: ${point.scheme.replace(/^\[[^\]]+\]\s*/, '')}`
        : `Insufficient evidence for: ${point.scheme.replace(/^\[[^\]]+\]\s*/, '')}`,
      improvementSuggestion:
        /explain/i.test(commandWord)
          ? 'Add the missing scientific point and link it with cause → effect.'
          : /compare/i.test(commandWord)
            ? 'Make a direct comparison using both items in the same statement.'
            : /evaluate/i.test(commandWord)
              ? 'Add relevant evidence on the other side and finish with a justified judgement.'
              : /plan|design/i.test(commandWord)
                ? 'Add the missing method detail, variable/control, measurement, repeat or data-processing step.'
                : isCalculation
                  ? 'Show the equation, substitution and final value clearly; include a unit if the mark scheme requires one.'
                  : 'State the complete scientific relationship explicitly.',
    })),
    lorRubric: lor,
    sigFigUnitAudit: units,
    misconceptions: contradictions,
    inDepthAnalysis: {
      physicsPrinciples: `Offline ${subject} examiner checks explicit mark-scheme evidence, accepted terminology, numerical agreement, calculation method and common misconceptions.`,
      stepByStepReasoning: isCalculation
        ? 'Method/equation evidence and numerical accuracy are separated so a valid method can retain credit even when the final value is wrong.'
        : 'Each supplied marking point is checked for explicit or equivalent scientific evidence, then the command word and overall structure are reviewed.',
      structureAndClarity:
        questionType === 'Extended 6-mark level-of-response'
          ? `${lor.levelDescription}. ${lor.justification}`
          : structure.satisfied
            ? 'The answer structure broadly matches the command word.'
            : structure.note,
    },
    officialMarkScheme: scheme,
    modelAnswer: body.modelAnswer || '',
    examinerConfidence: confidence,
    confidenceReason:
      borderline.length
        ? `${borderline.length} marking point${borderline.length === 1 ? '' : 's'} had borderline evidence, so the result should be treated cautiously.`
        : contradictions.length
          ? 'A possible scientific contradiction or misconception was detected; review is recommended rather than automatically subtracting a mark.'
          : confidence >= 82
            ? 'Most credited points had clear mark-scheme, numerical or equation evidence.'
            : confidence >= 68
              ? 'Several marking points were clear, but some wording, structure or calculation evidence remained ambiguous.'
              : 'The response has limited or ambiguous evidence; AI or teacher review is recommended.',
    reviewRecommended:
      confidence < 72 ||
      borderline.length > 0 ||
      contradictions.length > 0 ||
      questionType === 'Extended 6-mark level-of-response',
  };
}
