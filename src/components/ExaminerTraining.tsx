"use client";

import { useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle2, CircleAlert, RotateCcw, Target } from 'lucide-react';

type ResponseLevel = 'weak' | 'partial' | 'near-full';
type TrainingAttempt = { difference: number; exact: boolean; withinOne: boolean };

function cleanMarkPoint(point: string) {
  return point.replace(/^\[[^\]]+\]\s*/, '').trim();
}

function splitModelAnswer(answer: string) {
  const parts = answer
    .split(/(?<=[.!?;])\s+|\s*;\s*/)
    .map(part => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [answer.trim()];
}

function plausibleMisconception(question: Question) {
  const text = `${question.subject} ${question.topic} ${question.subTopic} ${question.prompt}`.toLowerCase();
  if (/photosynth|respirat/.test(text)) return 'Plants only respire when there is no light.';
  if (/enzyme/.test(text)) return 'The enzyme is used up by the reaction.';
  if (/diffusion|osmosis|active transport/.test(text)) return 'All movement across membranes requires energy.';
  if (/genetic|allele|mutation|evolution/.test(text)) return 'Organisms change because they need to adapt during their lifetime.';
  if (/antibiotic|bacteria|virus/.test(text)) return 'Antibiotics can kill viruses as well as bacteria.';
  if (/bond|ionic|covalent|metallic/.test(text)) return 'Ionic compounds conduct electricity as solids because they contain charged ions.';
  if (/rate|collision/.test(text)) return 'A catalyst increases the energy released by a reaction.';
  if (/equilibrium/.test(text)) return 'At equilibrium the forward and reverse reactions have stopped.';
  if (/acid|ph/.test(text)) return 'A lower pH means a weaker acid.';
  if (/current|circuit|resistance|potential/.test(text)) return 'Current is used up as it passes through a component.';
  if (/mass|weight|force/.test(text)) return 'Mass and weight are the same quantity.';
  if (/temperature|internal energy|particle/.test(text)) return 'Temperature is the total energy stored by an object.';
  if (/radioactive|half-life|decay/.test(text)) return 'A larger sample changes the half-life of the isotope.';
  if (/wave|frequency|wavelength/.test(text)) return 'Increasing frequency always increases wave speed.';
  return 'The answer contains a scientifically plausible statement but one important relationship is missing or incorrect.';
}

function calculationResponse(question: Question, level: ResponseLevel) {
  const markPoints = question.markScheme.map(cleanMarkPoint).filter(Boolean);
  const modelParts = splitModelAnswer(question.modelAnswer);

  if (level === 'weak') {
    return markPoints[0] || modelParts[0] || 'I would start by choosing an equation linking the quantities given.';
  }
  if (level === 'partial') {
    const parts = modelParts.slice(0, Math.max(1, modelParts.length - 1));
    return parts.join(' ') || markPoints.slice(0, Math.max(1, Math.ceil(markPoints.length / 2))).join(' ');
  }

  const almost = question.modelAnswer.replace(/\s*[A-Za-zΩ°⁻¹²³·]+\.?\s*$/, '').trim();
  return almost && almost !== question.modelAnswer ? almost : modelParts.slice(0, Math.max(1, modelParts.length - 1)).join(' ');
}

function explanationResponse(question: Question, level: ResponseLevel) {
  const parts = splitModelAnswer(question.modelAnswer);
  const keywords = question.requiredKeywords.filter(Boolean);

  if (level === 'weak') {
    const first = parts[0] || keywords.slice(0, 2).join(' ');
    return `${first} ${plausibleMisconception(question)}`.trim();
  }
  if (level === 'partial') {
    const count = Math.max(1, Math.ceil(parts.length * 0.55));
    const answer = parts.slice(0, count).join(' ');
    return answer || `${keywords.slice(0, Math.max(2, Math.ceil(keywords.length / 2))).join(', ')}.`;
  }

  if (parts.length > 1) return parts.slice(0, parts.length - 1).join(' ');
  if (keywords.length > 2) return `${keywords.slice(0, keywords.length - 1).join(', ')}.`;
  return question.modelAnswer;
}

function buildStudentResponse(question: Question, level: ResponseLevel) {
  return question.questionType === 'Short calculation'
    ? calculationResponse(question, level)
    : explanationResponse(question, level);
}

function levelLabel(level: ResponseLevel) {
  if (level === 'weak') return 'Weak response';
  if (level === 'partial') return 'Partial response';
  return 'Nearly full response';
}

export function ExaminerTraining({ onPracticeQuestion }: { onPracticeQuestion?: (questionId: string) => void }) {
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [questionType, setQuestionType] = useState('all');
  const [responseLevel, setResponseLevel] = useState<ResponseLevel>('partial');
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [studentMark, setStudentMark] = useState<number | null>(null);
  const [trainingResult, setTrainingResult] = useState<AnalysisResult | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingError, setTrainingError] = useState('');
  const [markerMode, setMarkerMode] = useState<'online' | 'offline'>('online');
  const [attempts, setAttempts] = useState<TrainingAttempt[]>([]);

  const topics = useMemo(() => Array.from(new Set(questions.map(question => question.topic))).sort(), []);
  const questionTypes = useMemo(() => Array.from(new Set(questions.map(question => question.questionType))).sort(), []);

  const trainingPool = useMemo(() => questions.filter(question =>
    question.maxMarks >= 2 && question.maxMarks <= 6 &&
    (topic === 'all' || question.topic === topic) &&
    (difficulty === 'all' || question.difficulty === difficulty) &&
    (questionType === 'all' || question.questionType === questionType),
  ), [topic, difficulty, questionType]);

  const trainingQuestion = trainingPool.length ? trainingPool[trainingIndex % trainingPool.length] : null;
  const sampleResponse = trainingQuestion ? buildStudentResponse(trainingQuestion, responseLevel) : '';

  const exactCount = attempts.filter(attempt => attempt.exact).length;
  const withinOneCount = attempts.filter(attempt => attempt.withinOne).length;
  const averageDifference = attempts.length
    ? (attempts.reduce((sum, attempt) => sum + attempt.difference, 0) / attempts.length).toFixed(1)
    : '—';

  const resetReveal = () => {
    setStudentMark(null);
    setTrainingResult(null);
    setTrainingError('');
  };

  const nextTraining = () => {
    setTrainingIndex(value => value + 1);
    resetReveal();
  };

  const handleFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setTrainingIndex(0);
    resetReveal();
  };

  const revealTrainingMark = async () => {
    if (!trainingQuestion || studentMark === null) return;
    setTrainingLoading(true);
    setTrainingError('');
    setTrainingResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: sampleResponse,
          questionPrompt: trainingQuestion.prompt,
          commandWord: trainingQuestion.commandWord,
          maxMarks: trainingQuestion.maxMarks,
          markScheme: trainingQuestion.markScheme,
          modelAnswer: trainingQuestion.modelAnswer,
          strictness: 'standard',
          provider: markerMode,
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.error || typeof data?.marksAwarded !== 'number') {
        throw new Error(data?.error || 'Could not mark this training response.');
      }
      const result = data as AnalysisResult;
      const difference = Math.abs(studentMark - result.marksAwarded);
      setTrainingResult(result);
      setAttempts(previous => [...previous, { difference, exact: difference === 0, withinOne: difference <= 1 }].slice(-30));
    } catch (error) {
      setTrainingError(error instanceof Error ? error.message : 'Could not mark this training response.');
    } finally {
      setTrainingLoading(false);
    }
  };

  const practiseQuestion = () => {
    if (!trainingQuestion) return;
    if (onPracticeQuestion) {
      onPracticeQuestion(trainingQuestion.id);
      return;
    }
    localStorage.setItem('aqaGcseScienceSelectedQuestion', trainingQuestion.id);
    localStorage.setItem('aqaGcseScienceDraftAnswer', '');
    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><Brain size={18} /> Examiner training mode</div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Mark answers like an examiner</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">Uses the same question bank and question styles as Practice. Decide the mark before revealing the examiner result, then inspect the evidence for every credited and lost mark.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border bg-slate-50 px-3 py-2"><div className="text-xl font-extrabold">{attempts.length}</div><div className="text-[10px] font-bold uppercase text-slate-500">Marked</div></div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"><div className="text-xl font-extrabold text-emerald-800">{attempts.length ? Math.round(exactCount / attempts.length * 100) : 0}%</div><div className="text-[10px] font-bold uppercase text-emerald-600">Exact</div></div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2"><div className="text-xl font-extrabold text-blue-800">{averageDifference}</div><div className="text-[10px] font-bold uppercase text-blue-600">Avg gap</div></div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
        <div>
          <div className="font-bold text-indigo-950">Examiner engine</div>
          <div className="text-xs text-indigo-800">Use AI for nuanced marking or the improved offline examiner for a fully local rule-based check.</div>
        </div>
        <div className="flex rounded-lg bg-white p-1 text-sm font-semibold shadow-sm">
          <button type="button" onClick={() => { setMarkerMode('online'); resetReveal(); }} className={`rounded-md px-3 py-2 ${markerMode === 'online' ? 'bg-indigo-700 text-white' : 'text-slate-600'}`}>AI examiner</button>
          <button type="button" onClick={() => { setMarkerMode('offline'); resetReveal(); }} className={`rounded-md px-3 py-2 ${markerMode === 'offline' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}>Offline examiner</button>
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-xl border bg-slate-50 p-3 sm:grid-cols-2 xl:grid-cols-4">
        <select value={topic} onChange={event => handleFilter(setTopic, event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm" aria-label="Examiner training topic"><option value="all">All topics</option>{topics.map(item => <option key={item} value={item}>{item}</option>)}</select>
        <select value={difficulty} onChange={event => handleFilter(setDifficulty, event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm" aria-label="Examiner training difficulty"><option value="all">All difficulties</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select>
        <select value={questionType} onChange={event => handleFilter(setQuestionType, event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm" aria-label="Examiner training question type"><option value="all">All question types</option>{questionTypes.map(item => <option key={item} value={item}>{item}</option>)}</select>
        <select value={responseLevel} onChange={event => { setResponseLevel(event.target.value as ResponseLevel); resetReveal(); }} className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm" aria-label="Student response quality"><option value="weak">Weak response</option><option value="partial">Partial response</option><option value="near-full">Nearly full response</option></select>
      </div>

      {!trainingQuestion ? (
        <div className="mt-5 rounded-xl border-2 border-dashed p-6 text-center text-sm text-slate-500">No practice-bank questions match these filters. Change one of the filters above.</div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white">
            <div className="flex flex-wrap gap-2"><Badge className="bg-indigo-600">Practice-bank question</Badge><Badge variant="outline" className="border-white/25 text-white">{trainingQuestion.commandWord}</Badge><Badge variant="outline" className="border-white/25 text-white">{trainingQuestion.maxMarks} marks</Badge><Badge variant="outline" className="border-white/25 text-white">{trainingQuestion.difficulty}</Badge></div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-indigo-200">{trainingQuestion.topic} · {trainingQuestion.subTopic} · {trainingQuestion.year}</div>
            <p className="mt-2 text-lg font-semibold leading-relaxed">{trainingQuestion.prompt}</p>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Student response to mark</div><Badge variant="outline">{levelLabel(responseLevel)}</Badge></div>
            <div className="mt-2 min-h-28 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm leading-relaxed text-slate-900">{sampleResponse}</div>

            <div className="mt-5 rounded-xl border bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="font-bold">What mark would you award?</div><div className="text-xs text-slate-500">Commit to a mark before seeing the mark scheme analysis.</div></div>{studentMark !== null ? <Badge className="bg-blue-700">Your mark: {studentMark}/{trainingQuestion.maxMarks}</Badge> : null}</div>
              <div className="mt-3 flex flex-wrap gap-2">{Array.from({ length: trainingQuestion.maxMarks + 1 }, (_, mark) => <button key={mark} type="button" onClick={() => { setStudentMark(mark); setTrainingResult(null); }} className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition ${studentMark === mark ? 'border-blue-700 bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50'}`}>{mark}</button>)}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2"><Button onClick={revealTrainingMark} disabled={trainingLoading || studentMark === null}>{trainingLoading ? 'Checking your judgement…' : 'Reveal examiner mark'}</Button><Button variant="outline" onClick={nextTraining}>New example</Button><Button variant="outline" onClick={practiseQuestion}><RotateCcw size={14} className="mr-1" />Answer this question yourself</Button></div>
            {trainingError ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{trainingError}</div> : null}

            {trainingResult && studentMark !== null ? (
              <div className="mt-5 space-y-4 border-t pt-5">
                {(() => {
                  const difference = studentMark - trainingResult.marksAwarded;
                  const exact = difference === 0;
                  return <div className={`rounded-xl border p-4 ${exact ? 'border-emerald-200 bg-emerald-50' : Math.abs(difference) === 1 ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex flex-wrap items-center gap-3"><div className="text-2xl font-extrabold">{markerMode === 'offline' ? 'Offline examiner' : 'Examiner'}: {trainingResult.marksAwarded}/{trainingResult.totalMarks}</div><div className="text-lg font-bold">You: {studentMark}/{trainingQuestion.maxMarks}</div>{exact ? <Badge className="bg-emerald-700"><CheckCircle2 size={13} className="mr-1" />Exact match</Badge> : <Badge className="bg-amber-700"><CircleAlert size={13} className="mr-1" />{difference > 0 ? `You were ${difference} too generous` : `You were ${Math.abs(difference)} too harsh`}</Badge>}</div><p className="mt-2 text-sm">{exact ? 'Your judgement matched the examiner engine exactly.' : Math.abs(difference) === 1 ? 'You were within one mark — inspect the evidence below to see the boundary you interpreted differently.' : 'Compare each mark point below and identify where your judgement diverged.'}</p></div>;
                })()}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-white p-4"><div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 size={16} />Credited evidence</div>{trainingResult.creditedPoints?.length ? <div className="mt-3 space-y-2">{trainingResult.creditedPoints.map((point, index) => <div key={`${point.mark}-${index}`} className="rounded-lg bg-emerald-50 p-3 text-sm"><div className="font-semibold">{point.mark}</div><div className="mt-1 text-slate-700">Evidence: {point.studentEvidence}</div></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No mark points were credited.</p>}</div>
                  <div className="rounded-xl border border-rose-200 bg-white p-4"><div className="flex items-center gap-2 font-bold text-rose-800"><Target size={16} />Marks not earned</div>{trainingResult.lostMarksAnalysis?.length ? <div className="mt-3 space-y-2">{trainingResult.lostMarksAnalysis.map((item, index) => <div key={`${item.reason}-${index}`} className="rounded-lg bg-rose-50 p-3 text-sm"><div>{item.reason}</div><div className="mt-1 font-medium text-blue-800">Improve: {item.improvementSuggestion}</div></div>)}</div> : <p className="mt-2 text-sm text-emerald-700">No marks were lost.</p>}</div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Question mark scheme</div><ol className="mt-2 space-y-2 text-sm">{trainingQuestion.markScheme.map((point, index) => <li key={`${point}-${index}`} className="rounded-lg border bg-white p-2"><strong>{index + 1}.</strong> {point}</li>)}</ol></div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><div className="text-xs font-bold uppercase tracking-wider text-indigo-700">Full-mark response</div><p className="mt-2 text-sm leading-relaxed text-indigo-950">{trainingQuestion.modelAnswer}</p></div>
                {attempts.length ? <div className="text-xs text-slate-500">Session accuracy: {exactCount}/{attempts.length} exact · {withinOneCount}/{attempts.length} within one mark · average difference {averageDifference} marks.</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
