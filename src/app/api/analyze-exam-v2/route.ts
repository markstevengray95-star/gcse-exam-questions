import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { getIndicativeGrade, PRACTICE_GRADE_NOTICE } from '@/lib/grading';
import { getRequestAiKey } from '@/lib/serverAi';

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
          evidencePages: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
          handwritingConfidence: { type: SchemaType.INTEGER },
          transcriptionIssue: { type: SchemaType.STRING },
          lostMarks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: [
          'questionNumber', 'topic', 'maxMarks', 'score', 'attempted', 'confidence',
          'reviewRecommended', 'examinerComment', 'studentEvidence', 'evidencePages',
          'handwritingConfidence', 'transcriptionIssue', 'lostMarks', 'improvements',
        ],
      },
    },
    overallStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    revisionActions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['examinerConfidence', 'confidenceReason', 'paperAudit', 'questionResults', 'overallStrengths', 'revisionActions'],
};

type ScriptPage = {
  pageNumber?: unknown;
  handwritingConfidence?: unknown;
  pageQuality?: unknown;
  transcription?: unknown;
  questionNumbers?: unknown;
  unclearSegments?: unknown;
  visualEvidence?: unknown;
  warnings?: unknown;
};

type RawQuestion = Record<string, unknown>;
type SanitizedQuestion = ReturnType<typeof sanitizeQuestion>;

function clamp(value: unknown, min: number, max: number) {
  const number = Math.trunc(Number(value) || 0);
  return Math.max(min, Math.min(max, number));
}

function stringList(value: unknown, limit = 20) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, limit)
    : [];
}

function numberList(value: unknown, limit = 20) {
  return Array.isArray(value)
    ? value.map(item => Math.trunc(Number(item))).filter(item => Number.isFinite(item) && item > 0 && item <= 200).slice(0, limit)
    : [];
}

function parseJson(text: string) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  return JSON.parse(first >= 0 && last >= 0 ? cleaned.slice(first, last + 1) : cleaned);
}

function sanitizeQuestion(item: RawQuestion, index: number) {
  const maxMarks = clamp(item.maxMarks, 0, 50);
  const score = clamp(item.score, 0, maxMarks);
  return {
    questionNumber: String(item.questionNumber || index + 1),
    topic: String(item.topic || 'Unclassified'),
    maxMarks,
    score,
    attempted: Boolean(item.attempted),
    confidence: clamp(item.confidence, 0, 100),
    reviewRecommended: Boolean(item.reviewRecommended),
    examinerComment: String(item.examinerComment || 'No examiner comment supplied.'),
    studentEvidence: String(item.studentEvidence || ''),
    evidencePages: numberList(item.evidencePages),
    handwritingConfidence: clamp(item.handwritingConfidence, 0, 100),
    transcriptionIssue: String(item.transcriptionIssue || ''),
    lostMarks: stringList(item.lostMarks, 10),
    improvements: stringList(item.improvements, 10),
  };
}

function topicSummary(questionResults: SanitizedQuestion[]) {
  const grouped = new Map<string, { earned: number; available: number; attempted: number }>();
  for (const question of questionResults) {
    const current = grouped.get(question.topic) || { earned: 0, available: 0, attempted: 0 };
    current.earned += question.score;
    current.available += question.maxMarks;
    if (question.attempted) current.attempted += 1;
    grouped.set(question.topic, current);
  }
  return [...grouped.entries()].map(([name, data]) => ({
    name,
    scorePercent: data.available ? Math.round(data.earned / data.available * 100) : 0,
    earnedMarks: data.earned,
    availableMarks: data.available,
    attempted: data.attempted,
  })).sort((a, b) => a.scorePercent - b.scorePercent);
}

function normalizePages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).map((raw, index) => {
    const page = (raw && typeof raw === 'object' ? raw : {}) as ScriptPage;
    return {
      pageNumber: clamp(page.pageNumber ?? index + 1, 1, 200),
      handwritingConfidence: clamp(page.handwritingConfidence, 0, 100),
      pageQuality: String(page.pageQuality || 'unknown'),
      transcription: String(page.transcription || '').trim().slice(0, 30_000),
      questionNumbers: stringList(page.questionNumbers, 50),
      unclearSegments: stringList(page.unclearSegments, 50),
      visualEvidence: stringList(page.visualEvidence, 50),
      warnings: stringList(page.warnings, 50),
    };
  });
}

function sourceParts(args: {
  systemPrompt: string;
  paperLabel: string;
  questionPaperText: string;
  questionPaperFileData?: string;
  questionPaperFileMimeType?: string;
  markSchemeText: string;
  markSchemeFileData?: string;
  markSchemeFileMimeType?: string;
  examText: string;
  examFileData?: string;
  examFileMimeType?: string;
  scriptPages: ReturnType<typeof normalizePages>;
}) {
  const parts: Array<Record<string, unknown>> = [
    { text: args.systemPrompt },
    { text: `PAPER LABEL: ${args.paperLabel || 'Not supplied'}` },
  ];
  if (args.questionPaperText) parts.push({ text: `QUESTION PAPER TEXT:\n${args.questionPaperText}` });
  if (args.questionPaperFileData) {
    parts.push({ text: 'OFFICIAL QUESTION PAPER FILE:' });
    parts.push({ inlineData: { data: args.questionPaperFileData, mimeType: args.questionPaperFileMimeType || 'application/pdf' } });
  }
  if (args.markSchemeText) parts.push({ text: `OFFICIAL MARK SCHEME TEXT:\n${args.markSchemeText}` });
  if (args.markSchemeFileData) {
    parts.push({ text: 'OFFICIAL MARK SCHEME FILE:' });
    parts.push({ inlineData: { data: args.markSchemeFileData, mimeType: args.markSchemeFileMimeType || 'application/pdf' } });
  }
  if (args.examText) parts.push({ text: `STUDENT TRANSCRIPTION / EXTRA ANSWERS:\n${args.examText}` });
  if (args.examFileData) {
    parts.push({ text: 'COMPLETED STUDENT SCRIPT FILE:' });
    parts.push({ inlineData: { data: args.examFileData, mimeType: args.examFileMimeType || 'application/pdf' } });
  }
  if (args.scriptPages.length) {
    parts.push({ text: `VERIFIED PHOTO-PAGE TRANSCRIPTIONS AND VISUAL EVIDENCE:\n${JSON.stringify(args.scriptPages)}` });
  }
  return parts;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const examText = String(body?.examText || '').trim();
    const questionPaperText = String(body?.questionPaperText || '').trim();
    const markSchemeText = String(body?.markSchemeText || '').trim();
    const paperLabel = String(body?.paperLabel || '').trim();
    const scriptPages = normalizePages(body?.scriptPages);
    const activeKey = getRequestAiKey(req);

    if (!body?.examFileData && !examText && !scriptPages.length) {
      return NextResponse.json({ error: 'Provide a completed script file, pasted answers, or at least one photographed script page.' }, { status: 400 });
    }
    if (!activeKey) return NextResponse.json({ error: 'Whole-exam marking requires a Gemini API key in this session or on the server.' }, { status: 400 });

    const hasQuestionPaper = Boolean(body?.questionPaperFileData || questionPaperText);
    const hasMarkScheme = Boolean(body?.markSchemeFileData || markSchemeText);
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', responseSchema, temperature: 0 },
    });

    const systemPrompt = `You are a senior AQA GCSE Science examiner marking a complete student script with an accuracy-first workflow.

SOURCE PRIORITY
1. Official mark scheme when supplied: primary authority for marks, alternatives, dependencies, tolerances and level descriptors.
2. Official question paper when supplied: authority for question numbering, wording and maximum marks.
3. Verified photo-page transcriptions / visual evidence or the completed script file: evidence of the student's work.
4. Optional typed transcription: supplementary evidence only; do not let it override a clearer photographed/script source unless it is explicitly an extra answer page.

PASS 1 — MAP THE PAPER
- Identify every mark-bearing sub-question in paper order.
- Match student evidence to the correct sub-question and page(s).
- Do not invent missing questions, responses, diagrams or marks.
- Detect missing pages, duplicated pages, numbering conflicts and continuation answers.

PASS 2 — APPLY THE MARK SCHEME PRECISELY
- Award each marking point only when the student's evidence satisfies it or a scientifically equivalent permitted alternative.
- For calculations separately consider method/equation, rearrangement, substitution, arithmetic, final value, unit, significant figures and follow-through/error-carried-forward where the scheme permits.
- Preserve method marks after arithmetic slips when justified. Do not double-penalise one error unless the scheme requires it.
- For explanations, mark causal reasoning and required distinctions, not keyword presence alone.
- For level-of-response, make a holistic judgement using scientific accuracy, breadth and logical linking.
- For graphs and diagrams, use the recorded visualEvidence: axes, labels, units, line/curve, gradient, intercepts, vectors, circuit connections and selected boxes can carry marks.
- Ignore harmless spelling or grammar if scientific meaning is unambiguous.

HANDWRITING / TRANSCRIPTION SAFETY
- Each photographed page has a handwritingConfidence and may contain [unclear] text. Never turn an uncertain character into confident evidence.
- If an uncertain digit/sign/unit/word could change whether a mark is earned, set reviewRecommended=true, lower question confidence, explain the issue in transcriptionIssue, and do NOT pretend the reading is certain.
- Still award independent method marks supported by clear working.
- If evidence is genuinely unreadable, say so; do not fabricate a transcription.
- evidencePages must list the photographed page numbers supporting the mark where photo pages are used.
- handwritingConfidence for each question should reflect the weakest material handwriting evidence used for that question; use 100 for reliably typed/PDF text with no handwriting ambiguity.

PASS 3 — SELF-AUDIT BEFORE RETURNING
- Re-check every awarded mark against the exact evidence and scheme.
- Check that score <= maxMarks for every row.
- Re-check follow-through, unit penalties, significant figures, contradictions, multiple-choice selections, graphs and level-of-response boundaries.
- Look specifically for both over-marking and under-marking.
- questionResults must contain one row per mark-bearing part.

If no official mark scheme is supplied, make cautious provisional judgements and lower confidence. If no separate question paper is supplied, infer structure only from reliable visible evidence and flag the limitation.
Return only JSON matching the schema.`;

    const baseArgs = {
      systemPrompt,
      paperLabel,
      questionPaperText,
      questionPaperFileData: body?.questionPaperFileData,
      questionPaperFileMimeType: body?.questionPaperFileMimeType,
      markSchemeText,
      markSchemeFileData: body?.markSchemeFileData,
      markSchemeFileMimeType: body?.markSchemeFileMimeType,
      examText,
      examFileData: body?.examFileData,
      examFileMimeType: body?.examFileMimeType,
      scriptPages,
    };

    const first = await model.generateContent(sourceParts(baseArgs) as any);
    const firstParsed = parseJson(first.response.text());

    const auditPrompt = `AUDIT THE DRAFT MARKING BELOW AS A SECOND EXAMINER. Use all original sources supplied again.

DRAFT RESULT:\n${JSON.stringify(firstParsed)}

Correct any mistakes. Check especially:
- question-to-answer alignment and maximum marks,
- missed valid alternative wording or methods,
- unjustified keyword-only credit,
- calculation follow-through and unit/significant-figure rules,
- contradictions and duplicated credit,
- graphs/diagrams/selected options from visualEvidence,
- any mark resting on uncertain handwriting,
- blank versus missing/unreadable evidence,
- level-of-response boundaries.

Return the COMPLETE corrected result in the same JSON schema. Do not merely comment on the draft.`;
    const secondParts = sourceParts({ ...baseArgs, systemPrompt: `${systemPrompt}\n\n${auditPrompt}` });
    const second = await model.generateContent(secondParts as any);
    const parsed = parseJson(second.response.text());

    const rawRows: RawQuestion[] = Array.isArray(parsed?.questionResults) ? parsed.questionResults : [];
    const questionResults = rawRows.map((row, index) => sanitizeQuestion(row, index)).slice(0, 180);
    if (!questionResults.length) {
      return NextResponse.json({ error: 'No mark-bearing question parts could be identified. Add the matching question paper/mark scheme or clearer script pages.' }, { status: 422 });
    }

    const totalScore = questionResults.reduce((sum, row) => sum + row.score, 0);
    const maxScore = questionResults.reduce((sum, row) => sum + row.maxMarks, 0);
    const questionsAttempted = questionResults.filter(row => row.attempted).length;
    const percent = maxScore ? Math.round(totalScore / maxScore * 100) : 0;
    const grade = getIndicativeGrade(percent);
    const topicBreakdown = topicSummary(questionResults);
    const weakestTopic = topicBreakdown.find(topic => topic.availableMarks > 0);
    const reviewCount = questionResults.filter(row => row.reviewRecommended).length;

    const audit = parsed?.paperAudit && typeof parsed.paperAudit === 'object' ? parsed.paperAudit : {};
    const warnings = stringList((audit as Record<string, unknown>).warnings, 30);
    if (!hasQuestionPaper) warnings.unshift('No separate question paper supplied; question mapping relied on the completed script evidence.');
    if (!hasMarkScheme) warnings.unshift('No official mark scheme supplied; marks are provisional estimates.');

    const pageConfidences = scriptPages.map(page => page.handwritingConfidence).filter(value => value > 0);
    const averageHandwritingConfidence = pageConfidences.length
      ? Math.round(pageConfidences.reduce((sum, value) => sum + value, 0) / pageConfidences.length)
      : 100;
    const unclearPages = scriptPages.filter(page => page.unclearSegments.length || page.warnings.length || page.handwritingConfidence < 75).map(page => page.pageNumber);

    let examinerConfidence = clamp(parsed?.examinerConfidence, 0, 100);
    if (!hasMarkScheme) examinerConfidence = Math.min(examinerConfidence, 60);
    if (!hasQuestionPaper) examinerConfidence = Math.min(examinerConfidence, 75);
    if (scriptPages.length) examinerConfidence = Math.min(examinerConfidence, Math.max(45, averageHandwritingConfidence));
    if (reviewCount) examinerConfidence = Math.min(examinerConfidence, Math.max(40, 92 - reviewCount * 3));

    return NextResponse.json({
      totalScore,
      maxScore,
      percent,
      estimatedGrade: grade.grade,
      gradeNotice: PRACTICE_GRADE_NOTICE,
      questionsAttempted,
      totalQuestions: questionResults.length,
      examinerConfidence,
      confidenceReason: String(parsed?.confidenceReason || 'Confidence reflects mark-scheme alignment, paper matching, handwriting clarity and the second-examiner audit.'),
      reviewRecommendedCount: reviewCount,
      handwritingAudit: {
        photoPagesAnalyzed: scriptPages.length,
        averageConfidence: averageHandwritingConfidence,
        unclearPages,
        totalUnclearSegments: scriptPages.reduce((sum, page) => sum + page.unclearSegments.length, 0),
      },
      paperAudit: {
        pagesDetected: scriptPages.length || clamp((audit as Record<string, unknown>).pagesDetected, 0, 300),
        questionPaperMatched: hasQuestionPaper && Boolean((audit as Record<string, unknown>).questionPaperMatched),
        markSchemeMatched: hasMarkScheme && Boolean((audit as Record<string, unknown>).markSchemeMatched),
        warnings,
      },
      questionResults,
      topicBreakdown,
      topRevisionPriority: weakestTopic ? {
        topic: weakestTopic.name,
        avgScorePercent: weakestTopic.scorePercent,
        notes: `Lowest-scoring identified topic: ${weakestTopic.earnedMarks}/${weakestTopic.availableMarks} marks. Use the question-level lost-mark reasons for revision.`,
      } : { topic: 'More evidence needed', avgScorePercent: 0, notes: 'No reliable topic priority could be calculated.' },
      overallStrengths: stringList(parsed?.overallStrengths, 10),
      revisionActions: stringList(parsed?.revisionActions, 12),
      markingBasis: {
        questionPaperSupplied: hasQuestionPaper,
        markSchemeSupplied: hasMarkScheme,
        photoPagesAnalyzed: scriptPages.length,
        handwritingVerifiedTwice: scriptPages.length > 0,
        secondExaminerAudit: true,
        scoreCalculatedFromQuestionRows: true,
      },
    });
  } catch (error) {
    console.error('Accurate whole-exam marker failed:', error);
    return NextResponse.json({ error: 'The whole-exam marker could not complete the accuracy audit. Check image clarity/file size and try again.' }, { status: 500 });
  }
}
