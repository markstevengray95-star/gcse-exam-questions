import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, ResponseSchema } from '@google/generative-ai';
import { offlineMark } from '@/lib/offlineMarker';
import { getRequestAiKey } from '@/lib/serverAi';

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    marksAwarded: { type: SchemaType.INTEGER },
    totalMarks: { type: SchemaType.INTEGER },
    commandWordCheck: {
      type: SchemaType.OBJECT,
      properties: {
        commandWord: { type: SchemaType.STRING },
        satisfied: { type: SchemaType.BOOLEAN },
        examinerNotes: { type: SchemaType.STRING },
      },
      required: ['commandWord', 'satisfied', 'examinerNotes'],
    },
    keywordAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        presentKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        laymanTermsUsed: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['presentKeywords', 'missingKeywords', 'laymanTermsUsed'],
    },
    creditedPoints: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          mark: { type: SchemaType.STRING },
          studentEvidence: { type: SchemaType.STRING },
        },
        required: ['mark', 'studentEvidence'],
      },
    },
    lostMarksAnalysis: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          reason: { type: SchemaType.STRING },
          improvementSuggestion: { type: SchemaType.STRING },
        },
        required: ['reason', 'improvementSuggestion'],
      },
    },
    lorRubric: {
      type: SchemaType.OBJECT,
      properties: {
        levelAwarded: { type: SchemaType.INTEGER, description: 'Level 1-3 or 0' },
        levelDescription: { type: SchemaType.STRING },
        justification: { type: SchemaType.STRING },
      },
    },
    sigFigUnitAudit: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          issue: { type: SchemaType.STRING },
          suggestion: { type: SchemaType.STRING },
        },
      },
    },
    misconceptions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    inDepthAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        physicsPrinciples: { type: SchemaType.STRING },
        stepByStepReasoning: { type: SchemaType.STRING },
        structureAndClarity: { type: SchemaType.STRING },
      },
      required: ['physicsPrinciples', 'stepByStepReasoning', 'structureAndClarity'],
    },
    officialMarkScheme: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    modelAnswer: { type: SchemaType.STRING },
    examinerConfidence: { type: SchemaType.INTEGER, description: '0-100 confidence based on evidence completeness' },
    confidenceReason: { type: SchemaType.STRING },
    reviewRecommended: { type: SchemaType.BOOLEAN },
  },
  required: [
    'marksAwarded',
    'totalMarks',
    'commandWordCheck',
    'keywordAnalysis',
    'creditedPoints',
    'lostMarksAnalysis',
    'inDepthAnalysis',
    'officialMarkScheme',
    'modelAnswer',
    'examinerConfidence', 'confidenceReason', 'reviewRecommended',
  ],
};

const SYSTEM_PROMPT = (strictness: string) => `You are a senior AQA GCSE Science examiner. Mark Biology, Chemistry or Physics using the supplied question and mark scheme. Mark one student answer using the supplied question, command word, maximum marks and mark scheme.

EXAMINER WORKFLOW (follow in order):
1. Read the whole student answer before deciding any marks.
2. Break the supplied mark scheme into individual creditable points. Never award more marks than those points allow.
3. For each point, search for explicit student evidence and record it before assigning the total.
4. Check contradictions: if the student later clearly contradicts a credited scientific statement, do not credit the contradicted statement unless the correct answer is unambiguous elsewhere.
5. For calculations, independently recompute from the student's stated values where possible and distinguish method, substitution, accuracy, unit and explanation marks.
6. For extended responses, apply level descriptors holistically; do not convert a level-of-response question into keyword counting.
7. Only after this evidence audit, total the marks.

MARKING PRIORITY (highest to lowest):
1. The supplied mark scheme is the source of truth for credit. Do not invent extra marks or require wording that the scheme does not require.
2. Credit scientifically equivalent wording when the scientific meaning is correct. Do NOT penalise a student merely because they say "voltage" instead of "potential difference" unless the distinction changes the scientific meaning in this question.
3. Credit a correct alternative method when it reaches a valid result and does not contradict the mark scheme.
4. Apply standard AQA conventions for linked marks: a later accuracy mark can be earned from a clearly correct method even if an earlier numerical step contains an arithmetic slip, unless the scheme explicitly makes that mark dependent on a correct previous result.
5. Ignore harmless spelling, grammar and notation slips when the intended physics is unambiguous.
6. Penalise contradictions, scientifically impossible claims, missing units where the mark scheme explicitly requires them, and incorrect substitutions.

CALCULATION RULES:
- Identify the student's equation, substitutions, intermediate values and final answer.
- Distinguish method marks from accuracy marks.
- Use the student's working, not just the final number.
- Check units and powers of ten.
- Do not award a mark twice for the same piece of evidence.
- Accept sensible rounding unless the scheme specifies a required precision.
- If the student's answer is dimensionally or physically impossible, explain why and do not award an accuracy mark.
- Follow-through: if a student makes one early arithmetic slip but uses their value consistently in a valid method, preserve eligible subsequent method/follow-through credit.

EXPLANATION RULES:
- For B1 points, identify the exact scientifically correct statement that earns the mark.
- For linked explanation chains, only award each point when the causal link is actually present.
- For 6-mark level-of-response questions, judge scientific accuracy, breadth, logical links and quality of explanation rather than simple keyword counting.

${strictness} strictness means rigorous evidence-based marking, not hostile marking. Never guess what the student intended when the wording is materially ambiguous.

FAIRNESS RULES:
- Do not over-credit keyword lists without a correct scientific relationship.
- Do not under-credit concise answers that contain all required science.
- Accept equivalent symbols, standard rearrangements and valid alternative routes.
- Do not penalise significant figures unless the question or scheme requires a specific precision.
- Treat units separately: missing units should not erase a correct method unless that mark specifically depends on units.

OUTPUT RULES:
- marksAwarded MUST be an integer from 0 to maxMarks.
- totalMarks MUST equal maxMarks.
- creditedPoints must cite the student's exact evidence or a faithful short excerpt.
- lostMarksAnalysis should only list marks genuinely unavailable under the supplied scheme.
- keywordAnalysis is diagnostic only and must NEVER determine the mark by itself.
- officialMarkScheme must reproduce the supplied scheme points in concise form.
- modelAnswer must answer the question correctly at the level expected for the mark total.
TWO-PASS FINAL REVIEW:
PASS 1 — Evidence audit: create a private point-by-point ledger of scheme point, student evidence, credit decision and reason.
PASS 2 — Examiner review: reread the whole answer and ledger, check the total for double counting, missed equivalent answers, contradictions, follow-through and level-of-response fairness. Correct the total if needed.
CONFIDENCE: Return examinerConfidence from 0-100. High confidence requires clear evidence and an unambiguous scheme. Lower confidence when handwriting/images are unclear, wording is genuinely ambiguous, a calculation has incomplete working, alternative valid interpretations exist, or an extended response sits between levels. Set reviewRecommended true when confidence is below 70 or the answer is materially ambiguous.
- Return only valid JSON matching the schema.`;

function buildContents(body: any) {
  const {
    studentAnswer,
    studentInlineData,
    questionPrompt,
    questionInlineData,
    commandWord,
    questionType,
    subject,
    requiredKeywords,
    maxMarks,
    markScheme,
    markSchemeInlineData,
    modelAnswer,
  } = body;

  const contents: any[] = [{ text: SYSTEM_PROMPT(body.strictness || 'standard') }];

  if (questionPrompt) contents.push({ text: `Question Prompt: ${questionPrompt}` });
  if (questionInlineData) {
    contents.push({ text: 'Question Image:' });
    contents.push({ inlineData: questionInlineData });
  }

  contents.push({
    text: [
      `Subject: ${subject || 'Science'}`,
      `Question Type: ${questionType || 'Not specified'}`,
      `Command Word: ${commandWord || 'None specified'}`,
      `Maximum Marks: ${Number.isFinite(Number(maxMarks)) ? Number(maxMarks) : 0}`,
      Array.isArray(requiredKeywords) && requiredKeywords.length
        ? `Diagnostic keywords (never use as a substitute for mark-scheme evidence): ${requiredKeywords.join(', ')}`
        : '',
    ].filter(Boolean).join('\n'),
  });

  if (markScheme) {
    const normalized = Array.isArray(markScheme) ? markScheme : [String(markScheme)];
    contents.push({ text: `AUTHORITATIVE MARK SCHEME:\n${normalized.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}` });
  }
  if (markSchemeInlineData) {
    contents.push({ text: 'Authoritative Mark Scheme Image:' });
    contents.push({ inlineData: markSchemeInlineData });
  }

  if (modelAnswer) contents.push({ text: `Reference Model Answer (use only as a secondary check; the mark scheme takes precedence): ${modelAnswer}` });

  if (studentAnswer) contents.push({ text: `STUDENT ANSWER:\n${studentAnswer}` });
  if (studentInlineData) {
    contents.push({ text: 'Student Answer Image:' });
    contents.push({ inlineData: studentInlineData });
  }

  return contents;
}

function sanitizeJson(text: string) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) return cleaned.slice(firstBrace, lastBrace + 1);
  return cleaned;
}

function clampResult(data: any, maxMarks: number) {
  const safeMax = Math.max(0, Math.trunc(Number(maxMarks) || 0));
  const marks = Math.max(0, Math.min(safeMax, Math.trunc(Number(data?.marksAwarded) || 0)));
  return { ...data, marksAwarded: marks, totalMarks: safeMax };
}

function isCalculationRequest(body: any) {
  const commandWord = String(body?.commandWord || '');
  const questionType = String(body?.questionType || '');
  const scheme = Array.isArray(body?.markScheme) ? body.markScheme.map(String).join(' ') : '';
  return (
    questionType === 'Short calculation' ||
    /calculate|show that/i.test(commandWord) ||
    /\\[(M|A|C)\\d+\\]/i.test(scheme) ||
    /equation|substitut|calculation|working/i.test(scheme)
  );
}

function needsVerification(body: any, primary: any, offline: any) {
  const difference = Math.abs(Number(primary?.marksAwarded || 0) - Number(offline?.marksAwarded || 0));
  return (
    Boolean(body?.studentInlineData) ||
    String(body?.questionType || '') === 'Extended 6-mark level-of-response' ||
    isCalculationRequest(body) ||
    Number(primary?.examinerConfidence || 0) < 82 ||
    Boolean(primary?.reviewRecommended) ||
    difference > 1 ||
    (Array.isArray(primary?.misconceptions) && primary.misconceptions.length > 0)
  );
}

function verificationPrompt(primary: any, offline: any, body: any) {
  const difference = Math.abs(Number(primary?.marksAwarded || 0) - Number(offline?.marksAwarded || 0));
  return `INDEPENDENT VERIFICATION PASS

You are now a second senior GCSE Science examiner. Re-mark the response independently from the original question, student answer and supplied mark scheme above. The first AI result and the rule-based cross-check are evidence to audit, not authorities.

FIRST AI RESULT:
${JSON.stringify(primary)}

RULE-BASED CROSS-CHECK SUMMARY:
- mark: ${offline?.marksAwarded}/${offline?.totalMarks}
- confidence: ${offline?.examinerConfidence}
- difference from first AI mark: ${difference}
- review recommended: ${Boolean(offline?.reviewRecommended)}

VERIFICATION RULES:
1. Re-check every awarded mark against explicit student evidence and the supplied mark scheme.
2. Do not award two marks for the same evidence unless the scheme genuinely separates them.
3. A misconception or contradiction does NOT create a negative mark. It only prevents credit for a point it directly invalidates.
4. Only use level-of-response bands when Question Type is exactly "Extended 6-mark level-of-response". A six-mark calculation or point-based question must stay point-based.
5. For calculations, separate method/equation marks from accuracy marks. Preserve legitimate follow-through after an arithmetic slip when the scheme permits it.
6. Missing units only lose credit when the supplied marking point requires a unit.
7. For Explain, require the scientific causal link where the scheme requires one. For Compare, require a direct comparison. For Evaluate, use the evidence and judgement demanded by the actual mark scheme; do not impose extra essay structure.
8. Scientifically equivalent wording must receive credit when its meaning matches the scheme.
9. Keywords are diagnostic only; never award a mark merely because a word appears.
10. If the first AI mark and offline mark differ, resolve the disagreement from the actual student evidence rather than averaging them.
11. Keep marksAwarded within 0–${Number(body?.maxMarks) || 0}, and totalMarks must equal the stated maximum.

Return a COMPLETE corrected marking result matching the required JSON schema. Do not include hidden reasoning or a chain of thought; include only concise examiner evidence and conclusions in the schema fields.`;
}

export async function POST(req: NextRequest) {
  let body: any;
  let numericMaxMarks = 0;

  try {
    body = await req.json();
    const {
      studentAnswer,
      studentInlineData,
      questionPrompt,
      questionInlineData,
      maxMarks,
      provider = 'online',
    } = body;

    if ((!studentAnswer && !studentInlineData) || (!questionPrompt && !questionInlineData)) {
      return NextResponse.json({ error: 'Missing required fields (need prompt and student answer)' }, { status: 400 });
    }

    numericMaxMarks = Math.max(0, Math.trunc(Number(maxMarks) || 0));
    const offline = clampResult(offlineMark(body), numericMaxMarks);

    if (provider === 'offline') {
      return NextResponse.json({
        ...offline,
        markerEngine: 'offline',
        verificationApplied: false,
      });
    }

    const activeKey = getRequestAiKey(req);
    if (!activeKey) {
      return NextResponse.json({
        ...offline,
        markerEngine: 'offline',
        verificationApplied: false,
        fallbackUsed: true,
        fallbackReason: 'No AI API key configured; offline examiner used automatically.',
      });
    }

    const requestContents = buildContents(body);
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0,
      },
    });

    const first = await model.generateContent(requestContents);
    const firstText = first.response.text();

    let primary: any;
    try {
      primary = clampResult(JSON.parse(sanitizeJson(firstText)), numericMaxMarks);
    } catch {
      console.error('Failed to parse primary grading response:', firstText);
      return NextResponse.json({
        ...offline,
        markerEngine: 'offline',
        verificationApplied: false,
        fallbackUsed: true,
        fallbackReason: 'Primary AI response was invalid; offline examiner used automatically.',
      });
    }

    const difference = Math.abs(Number(primary.marksAwarded || 0) - Number(offline.marksAwarded || 0));
    if (!needsVerification(body, primary, offline)) {
      return NextResponse.json({
        ...primary,
        markerEngine: 'ai',
        verificationApplied: false,
        offlineCrossCheckMark: offline.marksAwarded,
        markingDifference: difference,
      });
    }

    try {
      const verified = await model.generateContent([
        ...requestContents,
        { text: verificationPrompt(primary, offline, body) },
      ] as any);
      const verifiedText = verified.response.text();
      const finalResult = clampResult(JSON.parse(sanitizeJson(verifiedText)), numericMaxMarks);
      const finalDifference = Math.abs(Number(finalResult.marksAwarded || 0) - Number(offline.marksAwarded || 0));
      const verificationChange = Math.abs(Number(finalResult.marksAwarded || 0) - Number(primary.marksAwarded || 0));
      const unresolvedDisagreement = finalDifference > 1 || verificationChange > 1;
      const reportedConfidence = Math.max(0, Math.min(100, Number(finalResult.examinerConfidence || 0)));
      const adjustedConfidence = unresolvedDisagreement ? Math.min(reportedConfidence, 74) : reportedConfidence;

      return NextResponse.json({
        ...finalResult,
        examinerConfidence: adjustedConfidence,
        reviewRecommended: Boolean(finalResult.reviewRecommended) || unresolvedDisagreement,
        confidenceReason: unresolvedDisagreement
          ? `${String(finalResult.confidenceReason || 'Independent verification completed.')} The marking engines still differ materially, so teacher review is recommended.`
          : finalResult.confidenceReason,
        markerEngine: 'ai-verified',
        verificationApplied: true,
        primaryAiMark: primary.marksAwarded,
        offlineCrossCheckMark: offline.marksAwarded,
        markingDifference: finalDifference,
        verificationChange,
      });
    } catch (verificationError) {
      console.error('AI verification pass failed; returning primary mark:', verificationError);
      return NextResponse.json({
        ...primary,
        markerEngine: 'ai',
        verificationApplied: false,
        verificationFailed: true,
        offlineCrossCheckMark: offline.marksAwarded,
        markingDifference: difference,
        reviewRecommended: true,
        confidenceReason: `${String(primary?.confidenceReason || 'AI marking completed.')} Independent verification could not be completed, so review is recommended.`,
      });
    }
  } catch (error) {
    console.error('AI marking failed, automatically using offline fallback:', error);
    if (body) {
      const result = clampResult(offlineMark(body), numericMaxMarks);
      return NextResponse.json({
        ...result,
        markerEngine: 'offline',
        verificationApplied: false,
        fallbackUsed: true,
        fallbackReason: 'AI service unavailable; offline marker used automatically.',
      });
    }
    return NextResponse.json({ error: 'Unable to process marking request.' }, { status: 500 });
  }
}
