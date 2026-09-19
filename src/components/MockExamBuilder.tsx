"use client";

import { useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlarmClock, CheckCircle2, Flag, FileText, RotateCcw, ShieldCheck, TriangleAlert } from 'lucide-react';

type CourseKind = 'combined' | 'biology' | 'chemistry' | 'physics' | 'mixed';
type PaperKind = 'paper1' | 'paper2' | 'mixed';
type TierKind = 'foundation' | 'higher';
type Phase = 'setup' | 'exam' | 'results';
type MarkedRow = { question: Question; answer: string; result: AnalysisResult | null };

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function subjectAllowed(question: Question, course: CourseKind) {
  if (question.subject === 'Science') return true;
  if (course === 'mixed' || course === 'combined') return ['Biology', 'Chemistry', 'Physics'].includes(question.subject);
  if (course === 'biology') return question.subject === 'Biology';
  if (course === 'chemistry') return question.subject === 'Chemistry';
  return question.subject === 'Physics';
}

function poolFor(course: CourseKind, paper: PaperKind, tier: TierKind) {
  return questions.filter(question => {
    if (!subjectAllowed(question, course)) return false;
    if (course === 'combined' && question.course === 'Separate only') return false;
    if (tier === 'foundation' && question.tier === 'Higher only') return false;
    if (paper !== 'mixed' && question.paper !== 'Across papers' && question.paper !== (paper === 'paper1' ? 'Paper 1' : 'Paper 2')) return false;
    return true;
  });
}

function buildPaper(pool: Question[], targetMarks: number) {
  const selected: Question[] = [];
  const usedTopics = new Set<string>();
  const primary = shuffle(pool).sort((a, b) => Number(usedTopics.has(a.topic)) - Number(usedTopics.has(b.topic)));
  let marks = 0;

  for (const question of primary) {
    if (marks >= targetMarks && selected.length >= 6) break;
    selected.push(question);
    usedTopics.add(question.topic);
    marks += question.maxMarks;
  }
  return selected;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, '0');
  const secs = (safe % 60).toString().padStart(2, '0');
  return hours ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`;
}

function courseLabel(course: CourseKind) {
  if (course === 'combined') return 'Combined Science: Trilogy';
  if (course === 'biology') return 'Biology';
  if (course === 'chemistry') return 'Chemistry';
  if (course === 'physics') return 'Physics';
  return 'Mixed GCSE Science';
}

export function MockExamBuilder() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [course, setCourse] = useState<CourseKind>('combined');
  const [paper, setPaper] = useState<PaperKind>('paper1');
  const [tier, setTier] = useState<TierKind>('higher');
  const [targetMarks, setTargetMarks] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);
  const [rows, setRows] = useState<MarkedRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const availablePool = useMemo(() => poolFor(course, paper, tier), [course, paper, tier]);
  const currentQuestion = paperQuestions[currentIndex];
  const totalMarks = paperQuestions.reduce((sum, question) => sum + question.maxMarks, 0);
  const answeredCount = paperQuestions.filter(question => answers[question.id]?.trim()).length;

  const stopTimer = () => {
    if (timerId !== null) window.clearInterval(timerId);
    setTimerId(null);
  };

  const startTimer = (minutes: number) => {
    stopTimer();
    const endAt = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60);
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
      setRemaining(next);
      if (next <= 0) window.clearInterval(id);
    }, 1000);
    setTimerId(id);
  };

  const startExam = () => {
    const built = buildPaper(availablePool, targetMarks);
    if (!built.length) {
      setError('No questions match this combination. Try another subject, paper or tier.');
      return;
    }
    setPaperQuestions(built);
    setAnswers({});
    setFlagged([]);
    setCurrentIndex(0);
    setRows([]);
    setError('');
    setPhase('exam');
    startTimer(durationMinutes);
  };

  const reset = () => {
    stopTimer();
    setPhase('setup');
    setPaperQuestions([]);
    setAnswers({});
    setFlagged([]);
    setRows([]);
    setCurrentIndex(0);
    setRemaining(0);
    setError('');
    setProgress('');
  };

  const toggleFlag = (id: string) => {
    setFlagged(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  };

  const submitExam = async () => {
    if (!paperQuestions.length || submitting) return;
    stopTimer();
    setSubmitting(true);
    setError('');
    const marked: MarkedRow[] = [];

    try {

      for (let index = 0; index < paperQuestions.length; index += 1) {
        const question = paperQuestions[index];
        const answer = answers[question.id]?.trim() || '';
        setProgress(`Marking question ${index + 1} of ${paperQuestions.length}…`);

        if (!answer) {
          marked.push({ question, answer, result: null });
          continue;
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentAnswer: answer,
            questionPrompt: question.prompt,
            commandWord: question.commandWord,
            maxMarks: question.maxMarks,
            markScheme: question.markScheme,
            modelAnswer: question.modelAnswer,
            strictness: 'standard',
            provider: 'online',
          }),
        });
        const data = await response.json();
        marked.push({ question, answer, result: response.ok && !data?.error ? data as AnalysisResult : null });
      }

      setRows(marked);
      setPhase('results');

      const score = marked.reduce((sum, row) => sum + (row.result?.marksAwarded || 0), 0);
      const max = marked.reduce((sum, row) => sum + row.question.maxMarks, 0);
      try {
        const history = JSON.parse(localStorage.getItem('aqaGcseScienceMockHistory') || '[]') as unknown[];
        history.push({
          date: new Date().toISOString(),
          course,
          paper,
          tier,
          score,
          max,
          percent: max ? Math.round(score / max * 100) : 0,
        });
        localStorage.setItem('aqaGcseScienceMockHistory', JSON.stringify(history.slice(-10)));
      } catch {
        // Mock history is optional.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark the mock exam.');
    } finally {
      setSubmitting(false);
      setProgress('');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><FileText size={18} /> GCSE mock builder</div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Build a timed GCSE Science mock</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">Choose Combined Science or a separate science, select Paper 1 or Paper 2 and set the tier. The app builds a varied mock from the same GCSE question bank and marks each response against its mark scheme.</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Course</span>
            <select value={course} onChange={event => setCourse(event.target.value as CourseKind)} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold">
              <option value="combined">Combined Science: Trilogy</option>
              <option value="biology">Separate Biology</option>
              <option value="chemistry">Separate Chemistry</option>
              <option value="physics">Separate Physics</option>
              <option value="mixed">Mixed GCSE Science</option>
            </select>
          </label>
          <label className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Paper</span>
            <select value={paper} onChange={event => setPaper(event.target.value as PaperKind)} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold">
              <option value="paper1">Paper 1</option>
              <option value="paper2">Paper 2</option>
              <option value="mixed">Mixed papers</option>
            </select>
          </label>
          <label className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Tier</span>
            <select value={tier} onChange={event => setTier(event.target.value as TierKind)} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold">
              <option value="foundation">Foundation</option>
              <option value="higher">Higher</option>
            </select>
          </label>
          <div className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Question pool</span>
            <div className="mt-2 text-2xl font-extrabold">{availablePool.length}</div>
            <div className="text-xs text-slate-500">eligible bank questions</div>
          </div>
          <label className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Target marks</span>
            <input type="number" min={20} max={100} step={5} value={targetMarks} onChange={event => setTargetMarks(Math.max(20, Math.min(100, Number(event.target.value) || 50)))} className="mt-2 w-full rounded-xl border bg-white p-2" />
          </label>
          <label className="rounded-2xl border bg-slate-50 p-4">
            <span className="text-xs font-bold uppercase text-slate-500">Time</span>
            <select value={durationMinutes} onChange={event => setDurationMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold">
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={75}>75 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900"><ShieldCheck size={17} />Exam-style setup</div>
            <p className="mt-1 text-sm text-emerald-900">Hints and mark schemes stay hidden while the mock is running. Required-practical and working-scientifically questions can appear alongside topic questions.</p>
          </div>
        </div>

        {error ? <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert size={17} />{error}</div> : null}
        <Button size="lg" onClick={startExam} className="w-full rounded-xl bg-indigo-700 py-6 text-base font-bold hover:bg-indigo-800">Build and start mock</Button>
      </div>
    );
  }

  if (phase === 'results') {
    const score = rows.reduce((sum, row) => sum + (row.result?.marksAwarded || 0), 0);
    const max = rows.reduce((sum, row) => sum + row.question.maxMarks, 0);
    const percent = max ? Math.round(score / max * 100) : 0;
    const reviewCount = rows.filter(row => row.result?.reviewRecommended).length;

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-indigo-700">Mock exam report</div>
              <h2 className="mt-1 text-3xl font-extrabold">{score}/{max} · {percent}%</h2>
              <p className="mt-1 text-sm text-slate-500">{courseLabel(course)} · {paper === 'mixed' ? 'Mixed papers' : paper === 'paper1' ? 'Paper 1' : 'Paper 2'} · {tier === 'higher' ? 'Higher' : 'Foundation'} · {reviewCount} review flag{reviewCount === 1 ? '' : 's'}</p>
            </div>
            <Button variant="outline" onClick={reset} className="rounded-xl"><RotateCcw size={16} className="mr-2" />Build another mock</Button>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <details key={row.question.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Q{index + 1}</Badge>
                  <Badge className={row.question.subject === 'Biology' ? 'bg-emerald-700' : row.question.subject === 'Chemistry' ? 'bg-violet-700' : 'bg-blue-700'}>{row.question.subject}</Badge>
                  <span className="font-semibold">{row.question.topic}</span>
                  <span className="ml-auto text-lg font-extrabold">{row.result?.marksAwarded || 0}/{row.question.maxMarks}</span>
                  {row.result?.reviewRecommended ? <Badge className="bg-amber-600">Review</Badge> : null}
                </div>
              </summary>
              <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
                <div><div className="text-xs font-bold uppercase text-slate-500">Question</div><p className="mt-1 text-sm">{row.question.prompt}</p></div>
                <div><div className="text-xs font-bold uppercase text-slate-500">Your answer</div><p className="mt-1 whitespace-pre-wrap text-sm">{row.answer || 'No answer.'}</p></div>
                <div><div className="text-xs font-bold uppercase text-emerald-700">Credited</div><ul className="mt-1 list-disc pl-5 text-sm">{row.result?.creditedPoints?.map((item, i) => <li key={i}>{item.studentEvidence}</li>) || <li>No credited evidence recorded.</li>}</ul></div>
                <div><div className="text-xs font-bold uppercase text-amber-700">Improve</div><ul className="mt-1 list-disc pl-5 text-sm">{row.result?.lostMarksAnalysis?.map((item, i) => <li key={i}>{item.improvementSuggestion}</li>) || <li>No improvement point recorded.</li>}</ul></div>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-bold"><FileText size={17} />GCSE Science mock</div>
          <Badge className="bg-indigo-600">{courseLabel(course)}</Badge>
          <Badge className="bg-slate-700">{paper === 'mixed' ? 'Mixed papers' : paper === 'paper1' ? 'Paper 1' : 'Paper 2'}</Badge>
          <Badge className="bg-slate-700">{tier === 'higher' ? 'Higher' : 'Foundation'}</Badge>
          <div className={`ml-auto flex items-center gap-2 rounded-xl px-3 py-2 font-mono font-bold ${remaining <= 600 ? 'bg-red-600' : 'bg-slate-800'}`}><AlarmClock size={17} />{formatTime(remaining)}</div>
          <Button variant="outline" onClick={reset} className="border-slate-700 bg-transparent text-white hover:bg-slate-800">End mock</Button>
        </div>
      </div>

      {currentQuestion ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Question {currentIndex + 1}/{paperQuestions.length}</Badge>
            <Badge className={currentQuestion.subject === 'Biology' ? 'bg-emerald-700' : currentQuestion.subject === 'Chemistry' ? 'bg-violet-700' : 'bg-blue-700'}>{currentQuestion.subject}</Badge>
            <Badge variant="outline">{currentQuestion.maxMarks} marks</Badge>
            <button type="button" onClick={() => toggleFlag(currentQuestion.id)} className={`ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${flagged.includes(currentQuestion.id) ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}><Flag size={15} />{flagged.includes(currentQuestion.id) ? 'Flagged' : 'Flag'}</button>
          </div>
          <p className="mt-4 text-lg font-semibold leading-relaxed">{currentQuestion.prompt}</p>
          <textarea value={answers[currentQuestion.id] || ''} onChange={event => setAnswers(previous => ({ ...previous, [currentQuestion.id]: event.target.value }))} className="mt-5 min-h-52 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Write your exam answer here..." />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(index => Math.max(0, index - 1))}>Previous</Button>
            <Button variant="outline" disabled={currentIndex >= paperQuestions.length - 1} onClick={() => setCurrentIndex(index => Math.min(paperQuestions.length - 1, index + 1))}>Next</Button>
            <span className="ml-auto text-sm text-slate-500">{answeredCount}/{paperQuestions.length} answered · {flagged.length} flagged · {totalMarks} marks</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-4 shadow-sm">
        {paperQuestions.map((question, index) => (
          <button key={question.id} type="button" onClick={() => setCurrentIndex(index)} className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${index === currentIndex ? 'border-indigo-600 bg-indigo-600 text-white' : answers[question.id]?.trim() ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : flagged.includes(question.id) ? 'border-amber-300 bg-amber-50 text-amber-900' : 'bg-white'}`}>
            {answers[question.id]?.trim() ? <CheckCircle2 size={15} /> : index + 1}
          </button>
        ))}
        <Button onClick={() => void submitExam()} disabled={submitting} className="ml-auto bg-emerald-700 hover:bg-emerald-800">{submitting ? progress || 'Marking…' : 'Finish and mark mock'}</Button>
      </div>

      {error ? <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert size={17} />{error}</div> : null}
    </div>
  );
}
