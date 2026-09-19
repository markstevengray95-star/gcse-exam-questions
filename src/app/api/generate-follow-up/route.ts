import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, ResponseSchema, SchemaType } from '@google/generative-ai';
import { questions, type Question } from '@/data/questions';

type FollowUpQuestion = Question & { source: string; focus: string };

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
    maxMarks: { type: SchemaType.INTEGER },
    difficulty: { type: SchemaType.STRING },
    hint: { type: SchemaType.STRING },
    requiredKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    markScheme: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    modelAnswer: { type: SchemaType.STRING },
  },
  required: [
    'year', 'unit', 'topic', 'subTopic', 'commandWord', 'commandWordDefinition', 'questionType',
    'prompt', 'maxMarks', 'difficulty', 'hint', 'requiredKeywords', 'markScheme', 'modelAnswer',
  ],
};

function sanitizeJson(text: string) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  return first >= 0 && last >= first ? cleaned.slice(first, last + 1) : cleaned;
}

function focusFrom(body: any) {
  const feedback = body?.feedback || {};
  const misconception = Array.isArray(feedback.misconceptions) ? feedback.misconceptions.find((item: unknown) => typeof item === 'string' && item.trim()) : '';
  const lostReason = Array.isArray(feedback.lostMarksAnalysis)
    ? feedback.lostMarksAnalysis.find((item: any) => typeof item?.reason === 'string' && item.reason.trim())?.reason
    : '';
  const missingKeyword = Array.isArray(feedback?.keywordAnalysis?.missingKeywords)
    ? feedback.keywordAnalysis.missingKeywords.find((item: unknown) => typeof item === 'string' && item.trim())
    : '';
  return String(misconception || lostReason || missingKeyword || 'the weakest mark-scheme point from the previous answer').slice(0, 500);
}

function wordSet(text: string) {
  return new Set(text.toLowerCase().match(/[a-z0-9]+/g)?.filter(word => word.length > 3) || []);
}

function fallbackQuestion(current: Question, focus: string): FollowUpQuestion {
  const focusWords = wordSet(`${focus} ${current.subTopic} ${current.requiredKeywords.join(' ')}`);
  const candidates = questions.filter(question => question.id !== current.id && (question.topic === current.topic || question.subTopic === current.subTopic));
  const ranked = candidates
    .map(question => {
      const candidateWords = wordSet(`${question.subTopic} ${question.prompt} ${question.requiredKeywords.join(' ')}`);
      let score = question.subTopic === current.subTopic ? 6 : question.topic === current.topic ? 3 : 0;
      focusWords.forEach(word => { if (candidateWords.has(word)) score += 1; });
      return { question, score };
    })
    .sort((a, b) => b.score - a.score);

  const chosen = ranked[0]?.question || current;
  return {
    ...chosen,
    id: `follow-up-${chosen.id}-${Date.now()}`,
    source: 'Targeted follow-up selected from the original practice bank because AI generation was unavailable.',
    focus,
  };
}

function normalizeGenerated(data: any, current: Question, focus: string): FollowUpQuestion {
  const allowedTypes: Question['questionType'][] = ['Short calculation', 'Short explanation', 'Extended 6-mark level-of-response', 'Data analysis'];
  const allowedDifficulty: Question['difficulty'][] = ['Easy', 'Medium', 'Hard'];
  const allowedYears: Question['year'][] = ['Year 10', 'Year 11'];
  const maxMarks = Math.max(2, Math.min(6, Math.trunc(Number(data?.maxMarks) || Math.min(6, Math.max(3, current.maxMarks)))));
  const markScheme = Array.isArray(data?.markScheme) ? data.markScheme.map(String).filter(Boolean).slice(0, maxMarks) : [];

  return {
    id: `follow-up-${Date.now()}`,
    year: allowedYears.includes(data?.year) ? data.year : current.year,
    unit: String(data?.unit || current.unit),
    subject: current.subject,
    paper: current.paper,
    course: current.course,
    tier: current.tier,
    topic: String(data?.topic || current.topic),
    subTopic: String(data?.subTopic || current.subTopic),
    commandWord: String(data?.commandWord || 'Explain'),
    commandWordDefinition: String(data?.commandWordDefinition || 'Set out reasons or mechanisms using linked science.'),
    questionType: allowedTypes.includes(data?.questionType) ? data.questionType : 'Short explanation',
    prompt: String(data?.prompt || '').trim(),
    maxMarks,
    difficulty: allowedDifficulty.includes(data?.difficulty) ? data.difficulty : current.difficulty,
    hint: String(data?.hint || 'Focus on the science idea you missed in the previous attempt.'),
    template: '',
    requiredKeywords: Array.isArray(data?.requiredKeywords) ? data.requiredKeywords.map(String).filter(Boolean).slice(0, 10) : current.requiredKeywords.slice(0, 6),
    markScheme: markScheme.length ? markScheme : current.markScheme.slice(0, maxMarks),
    modelAnswer: String(data?.modelAnswer || current.modelAnswer),
    source: 'AI-generated original follow-up targeted to your previous misconception; not copied from an exam paper.',
    focus,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = body?.question as Question | undefined;
    if (!current?.prompt || !current?.topic || !current?.markScheme) {
      return NextResponse.json({ error: 'A valid source question is required.' }, { status: 400 });
    }

    const focus = focusFrom(body);
    const key = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
    if (!key) return NextResponse.json({ question: fallbackQuestion(current, focus), fallbackUsed: true });

    const prompt = `Create ONE new, original AQA GCSE Science practice question that directly targets a weakness from a student's previous attempt.

Previous question topic: ${current.topic}
Sub-topic: ${current.subTopic}
Previous question: ${current.prompt}
Target weakness/misconception: ${focus}
Previous mark scheme: ${current.markScheme.join(' | ')}

Requirements:
- Do not copy or closely imitate any published exam question wording.
- Test the same underlying misconception with a different context, numbers, wording or representation.
- Make the question fully self-contained and markable.
- Prefer 3-6 marks; use a short calculation/explanation unless an extended response is genuinely appropriate.
- Include a mark scheme with one clear credit point per available mark where possible.
- Include a concise model answer, useful hint and required keywords.
- Do not reveal the answer inside the question prompt.
- Keep the level appropriate for ${current.year} AQA GCSE Science and the supplied ${current.subject} topic.
Return only JSON matching the requested schema.`;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.35,
        },
      });
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(sanitizeJson(result.response.text()));
      const question = normalizeGenerated(parsed, current, focus);
      if (!question.prompt || !question.markScheme.length) throw new Error('Incomplete follow-up');
      return NextResponse.json({ question });
    } catch (error) {
      console.error('Follow-up AI generation failed, using bank fallback:', error);
      return NextResponse.json({ question: fallbackQuestion(current, focus), fallbackUsed: true });
    }
  } catch {
    return NextResponse.json({ error: 'Could not generate a targeted follow-up question.' }, { status: 400 });
  }
}
