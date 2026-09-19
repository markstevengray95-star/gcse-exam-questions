import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { getIndicativeGrade, PRACTICE_GRADE_NOTICE } from '@/lib/grading';

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    examinerConfidence: { type: SchemaType.INTEGER },
    confidenceReason: { type: SchemaType.STRING },
    paperAudit: {
      type: SchemaType.OBJECT,
      properties: {
        pagesDetected: { type: SchemaType.INTEGER },
        questionPaperMatched: { type: SchemaType.BOOLEAN },
        markSchemeMatched: { type: SchemaType.BOOLEAN },
        warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['pagesDetected', 'questionPaperMatched', 'markSchemeMatched', 'warnings'],
    },
    questionResults: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionNumber: { type: SchemaType.STRING },
          topic: { type: SchemaType.STRING },
          maxMarks: { type: SchemaType.INTEGER },
          score: { type: SchemaType.INTEGER },
          attempted: { type: SchemaType.BOOLEAN },
          confidence: { type: SchemaType.INTEGER },
          reviewRecommended: { type: SchemaType.BOOLEAN },
          examinerComment: { type: SchemaType.STRING },
          studentEvidence: { type: SchemaType.STRING },
          lostMarks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: [
          'questionNumber', 'topic', 'maxMarks', 'score', 'attempted', 'confidence',
          'reviewRecommended', 'examinerComment', 'studentEvidence', 'lostMarks', 'improvements',
        ],
      },
    },
    overallStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    revisionActions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['examinerConfidence', 'confidenceReason', 'paperAudit', 'questionResults', 'overallStrengths', 'revisionActions'],
};

type RawQuestionResult = {
  questionNumber?: unknown;
  topic?: unknown;
  maxMarks?: unknown;
  score?: unknown;
  attempted?: unknown;
  confidence?: unknown;
  reviewRecommended?: unknown;
  examinerComment?: unknown;
  studentEvidence?: unknown;
  lostMarks?: unknown;
  improvements?: unknown;
};

type SanitizedQuestion = ReturnType<typeof sanitizeQuestion>;

function clampInteger(value: unknown, min: number, max: number) {
  const number = Math.trunc(Number(value) || 0);
  return Math.max(min, Math.min(max, number));
}

function cleanStringArray(value: unknown, limit = 12) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).map(item => String(item).trim()).slice(0, limit)
    : [];
}

function sanitizeQuestion(item: RawQuestionResult, index: number) {
  const maxMarks = clampInteger(item.maxMarks, 0, 50);
  const score = clampInteger(item.score, 0, maxMarks);
  return {
    questionNumber: String(item.questionNumber || index + 1),
    topic: String(item.topic || 'Unclassified'),
    maxMarks,
    score,
    attempted: Boolean(item.attempted),
    confidence: clampInteger(item.confidence, 0, 100),
    reviewRecommended: Boolean(item.reviewRecommended),
    examinerComment: String(item.examinerComment || 'No examiner comment supplied.'),
    studentEvidence: String(item.studentEvidence || ''),
    lostMarks: cleanStringArray(item.lostMarks, 8),
    improvements: cleanStringArray(item.improvements, 8),
  };
}

function topicSummary(questionResults: SanitizedQuestion[]) {
  const grouped = new Map<string, { earned: number; available: number; attempted: number }>();
  for (const question of questionResults) {
    const key = question.topic || 'Unclassified';
    const current = grouped.get(key) || { earned: 0, available: 0, attempted: 0 };
    current.earned += question.score;
    current.available += question.maxMarks;
    if (question.attempted) current.attempted += 1;
    grouped.set(key, current);
  }
  return Array.from(grouped.entries())
    .map(([name, data]) => ({
      name,
      scorePercent: data.available ? Math.round((data.earned / data.available) * 100) : 0,
      earnedMarks: data.earned,
      availableMarks: data.available,
      attempted: data.attempted,
    }))
    .sort((a, b) => a.scorePercent - b.scorePercent);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      examFileData,
      examFileMimeType,
      examText,
      questionPaperFileData,
      questionPaperFileMimeType,
      questionPaperText,
      markSchemeFileData,
      markSchemeFileMimeType,
      markSchemeText,
      paperLabel,
      apiKey,
    } = body;

    if (!examFileData && !String(examText || '').trim()) {
      return NextResponse.json({ error: 'Please provide the completed student script or paste the student answers.' }, { status: 400 });
    }

    const activeKey = apiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      return NextResponse.json({ error: 'Whole-exam marking requires a Gemini API key in this session or on the server.' }, { status: 400 });
    }

    const hasQuestionPaper = Boolean(questionPaperFileData || String(questionPaperText || '').trim());
    const hasMarkScheme = Boolean(markSchemeFileData || String(markSchemeText || '').trim());
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.05,
      },
    });

    const systemPrompt = `You are a senior AQA GCSE Science examiner marking a complete exam script.

Your priority is accurate question-by-question marking, not producing a quick overall impression.

THREE-PASS WORKFLOW:
PASS 1 — PAPER MAP
- Identify every visible question and sub-question in order (for example 01.1, 01.2, 02.1).
- Determine the maximum mark for each part from the official mark scheme when supplied, otherwise from the question paper.
- Match each student response to the correct question part. Never silently attach an answer to a different question.
- Detect obvious missing pages, duplicated pages, unreadable regions, absent responses and numbering conflicts. Put these in paperAudit.warnings.

PASS 2 — MARK EACH QUESTION
- If an official mark scheme is supplied, it is the primary source of truth. Apply its marking points, dependencies, alternatives, tolerances and level descriptors.
- Quote or faithfully summarise the specific student evidence supporting credit.
- For calculations, distinguish equation/method, substitution, arithmetic/final answer, units and significant figures. Apply eligible error-carried-forward/follow-through where appropriate.
- Credit scientifically equivalent wording and valid alternative methods. Do not require exact phrasing unless the scheme requires a distinction.
- For explanations, require the causal links needed by the mark scheme rather than keyword counting.
- For level-of-response questions, make a holistic judgement using accuracy, breadth and logical linking.
- Do not award the same evidence twice. Check contradictions before crediting a point.
- A blank response scores zero only when the page/question is clearly present. If the script may be missing a page, flag reviewRecommended instead of pretending the evidence is complete.
- For multiple-choice questions, credit only the selected option that corresponds to the official answer.

PASS 3 — AUDIT
- Recheck every score against its maximum and re-sum the paper.
- Check question numbering, omitted parts, transcription uncertainty, ambiguous handwriting, cropped diagrams, graph work, units and answer-line continuations.
- confidence for each question is 0-100. Set reviewRecommended=true when handwriting, diagrams, missing context or scheme alignment makes the mark genuinely uncertain.
- Overall examinerConfidence must reflect the weakest evidence across the script, not just average image quality.

IMPORTANT FAIRNESS RULES:
- Ignore harmless spelling/grammar where scientific meaning is clear.
- Missing units lose credit only where required by the scheme/question.
- Preserve valid method/follow-through marks after arithmetic slips where allowed.
- Never invent marks, questions, student working or official grade boundaries.
- If no mark scheme is supplied, make cautious provisional judgements and lower confidence substantially.
- If no separate question paper is supplied, use visible question text in the completed script where possible and note the limitation.

OUTPUT REQUIREMENTS:
- questionResults must contain one row per identified mark-bearing question part, in paper order.
- maxMarks and score must be integer values with 0 <= score <= maxMarks.
- studentEvidence must be short and specific. Do not fabricate unreadable text.
- lostMarks should state why individual marks were unavailable.
- improvements should be precise actions for that question, not generic encouragement.
- Return only valid JSON matching the schema.`;

    const requestContents: Array<Record<string, unknown>> = [
      { text: systemPrompt },
      { text: `PAPER LABEL: ${String(paperLabel || 'Not supplied')}` },
    ];

    if (String(questionPaperText || '').trim()) {
      requestContents.push({ text: `QUESTION PAPER TEXT:\n${String(questionPaperText).trim()}` });
    }
    if (questionPaperFileData) {
      requestContents.push({ text: 'OFFICIAL QUESTION PAPER FILE:' });
      requestContents.push({ inlineData: { data: questionPaperFileData, mimeType: questionPaperFileMimeType || 'application/pdf' } });
    }

    if (String(markSchemeText || '').trim()) {
      requestContents.push({ text: `OFFICIAL MARK SCHEME TEXT:\n${String(markSchemeText).trim()}` });
    }
    if (markSchemeFileData) {
      requestContents.push({ text: 'OFFICIAL MARK SCHEME FILE:' });
      requestContents.push({ inlineData: { data: markSchemeFileData, mimeType: markSchemeFileMimeType || 'application/pdf' } });
    }

    if (String(examText || '').trim()) {
      requestContents.push({ text: `STUDENT ANSWERS / TRANSCRIPTION:\n${String(examText).trim()}` });
    }
    if (examFileData) {
      requestContents.push({ text: 'COMPLETED STUDENT SCRIPT FILE:' });
      requestContents.push({ inlineData: { data: examFileData, mimeType: examFileMimeType || 'application/pdf' } });
    }

    if (!hasQuestionPaper) requestContents.push({ text: 'No separate question paper was supplied. Infer question structure only from reliable visible evidence and flag uncertainty.' });
    if (!hasMarkScheme) requestContents.push({ text: 'No official mark scheme was supplied. Marks are provisional; lower confidence and state this limitation.' });

    const result = await model.generateContent(requestContents as any);
    const responseText = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    const jsonText = firstBrace !== -1 && lastBrace !== -1 ? responseText.slice(firstBrace, lastBrace + 1) : responseText;

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Invalid whole-exam JSON response:', responseText);
      return NextResponse.json({ error: 'The AI returned an invalid whole-exam report. Please try again.' }, { status: 500 });
    }

    const rawQuestionResults: RawQuestionResult[] = Array.isArray(parsed?.questionResults) ? parsed.questionResults : [];
    const questionResults: SanitizedQuestion[] = rawQuestionResults
      .map((item, index) => sanitizeQuestion(item, index))
      .slice(0, 150);

    if (!questionResults.length) {
      return NextResponse.json({ error: 'No mark-bearing question parts could be identified. Add the question paper and official mark scheme, or use a clearer completed script.' }, { status: 422 });
    }

    const totalScore = questionResults.reduce((sum, question) => sum + question.score, 0);
    const maxScore = questionResults.reduce((sum, question) => sum + question.maxMarks, 0);
    const questionsAttempted = questionResults.filter(question => question.attempted).length;
    const percent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
    const grade = getIndicativeGrade(percent);
    const topicBreakdown = topicSummary(questionResults);
    const weakestTopic = topicBreakdown.find(topic => topic.availableMarks > 0);
    const reviewCount = questionResults.filter(question => question.reviewRecommended).length;

    const audit = parsed?.paperAudit && typeof parsed.paperAudit === 'object' ? parsed.paperAudit : {};
    const warnings = cleanStringArray(audit.warnings, 20);
    if (!hasQuestionPaper) warnings.unshift('No separate question paper supplied; question matching relied on the completed script.');
    if (!hasMarkScheme) warnings.unshift('No official mark scheme supplied; marks are provisional estimates.');

    let examinerConfidence = clampInteger(parsed?.examinerConfidence, 0, 100);
    if (!hasMarkScheme) examinerConfidence = Math.min(examinerConfidence, 60);
    if (!hasQuestionPaper) examinerConfidence = Math.min(examinerConfidence, 75);
    if (reviewCount > 0) examinerConfidence = Math.min(examinerConfidence, Math.max(45, 90 - reviewCount * 3));

    return NextResponse.json({
      totalScore,
      maxScore,
      percent,
      estimatedGrade: grade.grade,
      gradeNotice: PRACTICE_GRADE_NOTICE,
      questionsAttempted,
      totalQuestions: questionResults.length,
      examinerConfidence,
      confidenceReason: String(parsed?.confidenceReason || 'Confidence is based on script clarity, page completeness and alignment to the question paper and mark scheme.'),
      reviewRecommendedCount: reviewCount,
      paperAudit: {
        pagesDetected: Math.max(0, Math.trunc(Number(audit.pagesDetected) || 0)),
        questionPaperMatched: hasQuestionPaper && Boolean(audit.questionPaperMatched),
        markSchemeMatched: hasMarkScheme && Boolean(audit.markSchemeMatched),
        warnings,
      },
      questionResults,
      topicBreakdown,
      topRevisionPriority: weakestTopic
        ? {
            topic: weakestTopic.name,
            avgScorePercent: weakestTopic.scorePercent,
            notes: `This was the lowest-scoring identified topic (${weakestTopic.earnedMarks}/${weakestTopic.availableMarks} marks). Review the lost-mark reasons in the question table.`,
          }
        : { topic: 'More evidence needed', avgScorePercent: 0, notes: 'No reliable topic priority could be calculated.' },
      overallStrengths: cleanStringArray(parsed?.overallStrengths, 8),
      revisionActions: cleanStringArray(parsed?.revisionActions, 10),
      markingBasis: {
        questionPaperSupplied: hasQuestionPaper,
        markSchemeSupplied: hasMarkScheme,
        scoreCalculatedFromQuestionRows: true,
      },
    });
  } catch (error) {
    console.error('Error analysing whole exam:', error);
    return NextResponse.json({ error: 'The whole-exam marker could not process this submission. Check file size/clarity and try again.' }, { status: 500 });
  }
}
