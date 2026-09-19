import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, ResponseSchema } from '@google/generative-ai';
import { offlineMark } from '@/lib/offlineMarker';

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
    text: `Command Word: ${commandWord || 'None specified'}\nMaximum Marks: ${Number.isFinite(Number(maxMarks)) ? Number(maxMarks) : 0}`,
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
    const requestContents = buildContents(body);
    let responseText = '';

    if (provider === 'offline') {
      // Deterministic fallback: works in Vercel/browser deployments without Ollama or an API key.
      return NextResponse.json(clampResult(offlineMark(body), numericMaxMarks));
    } else {
      const activeKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!activeKey) {
        const result = clampResult(offlineMark(body), numericMaxMarks);
        return NextResponse.json({ ...result, fallbackUsed: true, fallbackReason: 'No AI API key configured; offline examiner used automatically.' });
      }

      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1,
        },
      });

      const result = await model.generateContent(requestContents);
      responseText = result.response.text();
    }

    try {
      const parsed = JSON.parse(sanitizeJson(responseText));
      return NextResponse.json(clampResult(parsed, numericMaxMarks));
    } catch (parseError) {
      console.error('Failed to parse grading response:', responseText);
      return NextResponse.json({ error: 'The AI generated an invalid grading response. Please try submitting again.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('AI marking failed, automatically using offline fallback:', error);
    if (body) {
      const result = clampResult(offlineMark(body), numericMaxMarks);
      return NextResponse.json({ ...result, fallbackUsed: true, fallbackReason: 'AI service unavailable; offline marker used automatically.' });
    }
    return NextResponse.json({ error: 'Unable to process marking request.' }, { status: 500 });
  }
}
