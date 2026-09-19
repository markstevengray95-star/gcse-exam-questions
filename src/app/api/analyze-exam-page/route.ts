import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';

const pageSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    pageNumber: { type: SchemaType.INTEGER },
    handwritingConfidence: { type: SchemaType.INTEGER },
    pageQuality: { type: SchemaType.STRING },
    transcription: { type: SchemaType.STRING },
    questionNumbers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    unclearSegments: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    visualEvidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    'pageNumber',
    'handwritingConfidence',
    'pageQuality',
    'transcription',
    'questionNumbers',
    'unclearSegments',
    'visualEvidence',
    'warnings',
  ],
};

type PageAnalysis = {
  pageNumber: number;
  handwritingConfidence: number;
  pageQuality: string;
  transcription: string;
  questionNumbers: string[];
  unclearSegments: string[];
  visualEvidence: string[];
  warnings: string[];
};

function clamp(value: unknown, min: number, max: number) {
  const n = Math.trunc(Number(value) || 0);
  return Math.max(min, Math.min(max, n));
}

function strings(value: unknown, limit = 30) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, limit)
    : [];
}

function parseJson(text: string) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  return JSON.parse(first >= 0 && last >= 0 ? cleaned.slice(first, last + 1) : cleaned);
}

function sanitize(raw: Record<string, unknown>, fallbackPage: number): PageAnalysis {
  return {
    pageNumber: clamp(raw.pageNumber ?? fallbackPage, 1, 200),
    handwritingConfidence: clamp(raw.handwritingConfidence, 0, 100),
    pageQuality: String(raw.pageQuality || 'unknown').slice(0, 80),
    transcription: String(raw.transcription || '').trim().slice(0, 30_000),
    questionNumbers: strings(raw.questionNumbers, 40),
    unclearSegments: strings(raw.unclearSegments, 40),
    visualEvidence: strings(raw.visualEvidence, 40),
    warnings: strings(raw.warnings, 40),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageData = String(body?.imageData || '');
    const mimeType = String(body?.mimeType || 'image/jpeg');
    const pageNumber = clamp(body?.pageNumber, 1, 200);
    const totalPages = clamp(body?.totalPages, 1, 200);
    const paperLabel = String(body?.paperLabel || 'Not supplied');
    const activeKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!imageData) return NextResponse.json({ error: 'No page image was supplied.' }, { status: 400 });
    if (!activeKey) return NextResponse.json({ error: 'Handwriting analysis requires a Gemini API key in this session or on the server.' }, { status: 400 });
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mimeType)) {
      return NextResponse.json({ error: 'Exam photo must be JPG, PNG or WEBP.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: pageSchema,
        temperature: 0,
      },
    });

    const transcriptionPrompt = `You are performing a forensic-quality transcription of ONE photographed page of an AQA GCSE Science student exam script.

This is page ${pageNumber} of ${totalPages}. Paper label: ${paperLabel}.

Your job is to READ, not mark.
- Transcribe the student's final visible answer faithfully. Do not improve grammar, science, equations or numerical work.
- Preserve equation symbols, negative signs, powers of ten, prefixes, units, decimal points, significant figures and inequality signs as accurately as possible.
- Preserve the order of working. Use plain-text mathematical notation where necessary, for example 3.2e-4, v^2, deltaE.
- Identify visible question/sub-question numbers exactly where possible.
- If text or a character is genuinely uncertain, write [unclear: ...] in the transcription and list it in unclearSegments. NEVER silently guess an uncertain digit, sign, unit or science word.
- Distinguish crossed-out work from the final uncrossed answer. Mention materially relevant crossed-out work in visualEvidence but do not treat it as the final response unless it is clearly reinstated.
- Describe graphs, diagrams, circuit additions, labelled arrows, drawn field lines, working on axes and other non-text evidence in visualEvidence. Include axis labels, units, gradient triangles and selected multiple-choice boxes when visible.
- If the image is blurred, cropped, shadowed, rotated, low-resolution or has glare, put that in warnings and reduce handwritingConfidence.
- pageQuality should be one of: excellent, good, usable, poor.
- handwritingConfidence is confidence in faithful transcription, not confidence in whether the science is correct.
- Do not invent content outside the photographed page.`;

    const first = await model.generateContent([
      { text: transcriptionPrompt },
      { inlineData: { data: imageData, mimeType } },
    ] as any);
    const firstRaw = sanitize(parseJson(first.response.text()), pageNumber);

    const verificationPrompt = `Independently VERIFY the transcription below against the same original page image.

First-pass transcription JSON:
${JSON.stringify(firstRaw)}

Return a corrected final JSON result using the same schema. Check especially:
1. question numbers and continuation answers,
2. every digit, decimal point, negative sign and exponent,
3. equation symbols and rearrangements,
4. units and SI prefixes,
5. selected multiple-choice answers,
6. labels and numerical information on graphs/diagrams,
7. whether crossed-out writing was accidentally treated as final,
8. any text the first pass guessed too confidently.

Where the image does not support an exact reading, KEEP uncertainty explicit rather than guessing. A cautious [unclear] is better than a false transcription. handwritingConfidence should reflect the verified result.`;

    const second = await model.generateContent([
      { text: verificationPrompt },
      { inlineData: { data: imageData, mimeType } },
    ] as any);
    const verified = sanitize(parseJson(second.response.text()), pageNumber);

    // Do not allow a verification pass to erase uncertainty discovered on the first pass without replacement evidence.
    if (firstRaw.unclearSegments.length && !verified.unclearSegments.length && verified.handwritingConfidence > firstRaw.handwritingConfidence + 15) {
      verified.warnings.unshift('Verification confidence rose substantially after an uncertain first pass; examiner should review this page if the disputed text affects marks.');
      verified.handwritingConfidence = Math.min(verified.handwritingConfidence, firstRaw.handwritingConfidence + 15);
    }

    return NextResponse.json(verified);
  } catch (error) {
    console.error('Exam page handwriting analysis failed:', error);
    return NextResponse.json({ error: 'This exam photo could not be read reliably. Try a clearer, straight-on photo with the full page visible.' }, { status: 500 });
  }
}
