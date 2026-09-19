import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { specificationPoints } from '@/data/specification';
import { specCoverageQuestions } from '@/data/specCoverageQuestions';

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    year: { type: SchemaType.STRING },
    unit: { type: SchemaType.STRING },
    topic: { type: SchemaType.STRING },
    subTopic: { type: SchemaType.STRING },
    commandWord: { type: SchemaType.STRING },
    commandWordDefinition: { type: SchemaType.STRING },
    questionType: { type: SchemaType.STRING },
    prompt: { type: SchemaType.STRING },
    hint: { type: SchemaType.STRING },
    requiredKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    markScheme: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    modelAnswer: { type: SchemaType.STRING },
  },
  required: ['year', 'unit', 'topic', 'subTopic', 'commandWord', 'commandWordDefinition', 'questionType', 'prompt', 'hint', 'requiredKeywords', 'markScheme', 'modelAnswer'],
};

function normaliseDifficulty(value: unknown): 'Easy' | 'Medium' | 'Hard' {
  return value === 'Easy' || value === 'Hard' ? value : 'Medium';
}

function normaliseQuestionType(value: unknown, marks: number): 'Short calculation' | 'Extended 6-mark level-of-response' | 'Data analysis' | 'Short explanation' {
  if (value === 'Short calculation' || value === 'Data analysis' || value === 'Short explanation') return value;
  if (value === 'Extended 6-mark level-of-response' && marks === 6) return value;
  return marks === 6 ? 'Extended 6-mark level-of-response' : 'Short explanation';
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function closestSpecificationPoint(area: string) {
  const needle = normalise(area);
  const tokens = needle.split(/\s+/).filter(token => token.length > 2);
  let best = specificationPoints[0];
  let bestScore = -1;

  for (const point of specificationPoints) {
    const haystack = normalise([point.label, point.section, point.topic, point.specCode, ...point.match].join(' '));
    let score = haystack.includes(needle) ? 20 : 0;
    for (const token of tokens) if (haystack.includes(token)) score += 2;
    if (score > bestScore) {
      best = point;
      bestScore = score;
    }
  }
  return best;
}

function fallbackQuestion(area: string, marks: number, difficulty: 'Easy' | 'Medium' | 'Hard', reason: string) {
  const point = closestSpecificationPoint(area);
  const base = specCoverageQuestions.find(question => question.specificationPointId === point.id);
  if (!base) throw new Error(`No fallback question exists for ${point.label}`);

  return {
    ...base,
    id: `custom-fallback-${point.id}-${Date.now()}`,
    maxMarks: marks,
    difficulty,
    questionType: marks === 6 ? 'Extended 6-mark level-of-response' as const : 'Short explanation' as const,
    prompt: marks === 6 ? base.prompt : `${base.prompt} Give enough clear GCSE science for ${marks} marks.`,
    markScheme: base.markScheme.slice(0, marks),
    source: `${reason} Closest verified AQA area: ${point.specCode} ${point.label}.`,
  };
}

export async function POST(req: NextRequest) {
  let area = '';
  let marks = 4;
  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';

  try {
    const body = await req.json();
    area = String(body?.area || '').trim().slice(0, 160);
    marks = Math.max(2, Math.min(6, Math.trunc(Number(body?.marks) || 4)));
    difficulty = normaliseDifficulty(body?.difficulty);
    const activeKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (area.length < 3) {
      return NextResponse.json({ error: 'Type a GCSE science area or skill, for example “osmosis”, “electrolysis” or “wave speed”.' }, { status: 400 });
    }

    const closest = closestSpecificationPoint(area);
    if (!activeKey) {
      return NextResponse.json({ question: fallbackQuestion(area, marks, difficulty, 'Generated from the built-in full-specification bank because no Gemini key is available.') });
    }

    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json', responseSchema, temperature: 0.35 },
      });

      const prompt = `Create ONE original AQA GCSE Science practice question focused tightly on: "${area}".
Closest verified AQA specification area: ${closest.specCode} ${closest.label}.
Difficulty: ${difficulty}. Maximum marks: ${marks}.

Rules:
- Stay strictly within the current AQA GCSE Biology 8461, Chemistry 8462, Physics 8463 and Combined Science: Trilogy 8464 knowledge and skills for the closest verified area.
- Do not copy or closely imitate wording from a real copyrighted past-paper question.
- Make numerical data internally consistent and recompute any calculation yourself.
- The mark scheme must contain exactly ${marks} independently creditable one-mark points and should label them [B1], [C1] or [A1] where sensible.
- The model answer must earn all ${marks} marks and use correct SI units, symbols, superscripts and significant figures.
- Use one questionType value exactly: Short calculation, Short explanation, Data analysis, Extended 6-mark level-of-response. Only use the extended type for a genuine 6-mark response.
- year must be exactly Year 10 or Year 11.
- requiredKeywords are diagnostic only and must not replace proper mark-scheme logic.
Return only the structured JSON.`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      const parsed = JSON.parse(start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw);
      const markScheme = Array.isArray(parsed.markScheme) ? parsed.markScheme.map((item: unknown) => String(item)).slice(0, marks) : [];
      if (markScheme.length !== marks || !String(parsed.prompt || '').trim() || !String(parsed.modelAnswer || '').trim()) throw new Error('Incomplete generated question');

      return NextResponse.json({
        question: {
          id: `custom-generated-${Date.now()}`,
          specificationPointId: closest.id,
          year: parsed.year === 'Year 10' ? 'Year 10' : 'Year 11',
          subject: closest.subject,
          paper: closest.paper,
          course: closest.course,
          tier: closest.tier,
          unit: String(parsed.unit || closest.unit),
          topic: String(parsed.topic || closest.topic),
          subTopic: String(parsed.subTopic || closest.label),
          commandWord: String(parsed.commandWord || 'Explain'),
          commandWordDefinition: String(parsed.commandWordDefinition || 'Respond using the science requested by the command word.'),
          questionType: normaliseQuestionType(parsed.questionType, marks),
          prompt: String(parsed.prompt),
          maxMarks: marks,
          difficulty,
          hint: String(parsed.hint || closest.hint),
          template: '',
          requiredKeywords: Array.isArray(parsed.requiredKeywords) ? parsed.requiredKeywords.map((item: unknown) => String(item)).slice(0, 10) : closest.match.slice(0, 10),
          markScheme,
          modelAnswer: String(parsed.modelAnswer),
          source: `AI-generated original question · ${closest.specCode} ${closest.label}.`,
        },
      });
    } catch (aiError) {
      console.error('AI custom generation failed; using specification fallback:', aiError);
      return NextResponse.json({ question: fallbackQuestion(area, marks, difficulty, 'AI generation was unavailable, so the verified specification-bank fallback was used.') });
    }
  } catch (error) {
    console.error('Custom question generation failed:', error);
    if (area.length >= 3) {
      try {
        return NextResponse.json({ question: fallbackQuestion(area, marks, difficulty, 'The generator recovered using the verified specification-bank fallback.') });
      } catch {
        // Fall through to the final error.
      }
    }
    return NextResponse.json({ error: 'Could not generate a reliable GCSE Science question. Please try again.' }, { status: 500 });
  }
}
