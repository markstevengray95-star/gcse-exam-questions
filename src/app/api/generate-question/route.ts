import { NextRequest, NextResponse } from 'next/server';
import { specificationPoints } from '@/data/specification';
import { specCoverageQuestions } from '@/data/specCoverageQuestions';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

function normaliseDifficulty(value: unknown): Difficulty {
  return value === 'Easy' || value === 'Hard' ? value : 'Medium';
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findSpecificationPoint(input: unknown) {
  const requested = String(input || '').trim();
  if (!requested) return specificationPoints[0];
  const exact = specificationPoints.find(point => point.id === requested || point.specCode === requested);
  if (exact) return exact;

  const needle = normalise(requested);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const point = findSpecificationPoint(body?.topic || body?.area);
    const requestedMarks = Math.max(2, Math.min(6, Math.trunc(Number(body?.marks) || 6)));
    const difficulty = normaliseDifficulty(body?.difficulty);
    const base = specCoverageQuestions.find(question => question.specificationPointId === point.id);

    if (!base) {
      return NextResponse.json({ error: `No generator template is available for ${point.label}.` }, { status: 500 });
    }

    return NextResponse.json({
      question: {
        ...base,
        id: `generated-${point.id}-${Date.now()}`,
        maxMarks: requestedMarks,
        difficulty,
        questionType: requestedMarks === 6 ? 'Extended 6-mark level-of-response' : 'Short explanation',
        prompt: requestedMarks === 6 ? base.prompt : `${base.prompt} Give enough clear physics for ${requestedMarks} marks.`,
        markScheme: base.markScheme.slice(0, requestedMarks),
        source: `Original AQA specification-style generator · ${point.specCode} ${point.label}.`,
      },
    });
  } catch (error) {
    console.error('Preset question generation failed:', error);
    return NextResponse.json({ error: 'Could not generate a practice question. Please try again.' }, { status: 500 });
  }
}
