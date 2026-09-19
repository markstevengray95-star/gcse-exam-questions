"use client";

import { useEffect, useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlarmClock, CheckCircle2, Flag, FileText, RotateCcw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';

type PaperKind = 'paper1' | 'paper2' | 'paper3a' | 'paper3b' | 'mixed';
type Phase = 'setup' | 'exam' | 'results';
type MarkedRow = { question: Question; answer: string; result: AnalysisResult | null };

type SavedSession = {
  active: boolean;
  paper: PaperKind;
  optionTopic: string;
  targetMarks: number;
  durationMinutes: number;
  questionIds: string[];
  answers: Record<string, string>;
  flagged: string[];
  currentIndex: number;
  endAt: number;
};

const OPTION_TOPICS = ['Astrophysics', 'Medical Physics', 'Engineering Physics', 'Turning Points in Physics', 'Electronics'];

function textOf(question: Question) {
  return `${question.unit} ${question.topic} ${question.subTopic} ${question.prompt}`.toLowerCase();
}

function poolForPaper(paper: PaperKind, optionTopic: string) {
  if (paper === 'paper1') {
    return questions.filter(question => {
      const text = textOf(question);
      return /measurements|particles|radiation|waves|mechanics|materials|electricity|circuits|simple harmonic|shm/.test(text) && !/option/.test(question.unit.toLowerCase());
    });
  }
  if (paper === 'paper2') {
    return questions.filter(question => {
      const text = textOf(question);
      return /thermal|circular|gravit|electric field|magnetic|induction|capacitor|radioactivity|nuclear|fields/.test(text) && !/option/.test(question.unit.toLowerCase());
    });
  }
  if (paper === 'paper3a') {
    const practical = questions.filter(question => /practical|uncertainty|graph|gradient|data|measurement|experiment/.test(textOf(question)));
    const general = questions.filter(question => !practical.some(item => item.id === question.id) && !/option/.test(question.unit.toLowerCase()));
    return [...practical, ...general];
  }
  if (paper === 'paper3b') {
    return questions.filter(question => textOf(question).includes(optionTopic.toLowerCase()));
  }
  return questions;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPaper(pool: Question[], targetMarks: number) {
  const selected: Question[] = [];
  const seenTopics = new Set<string>();
  const varied = shuffle(pool).sort((a, b) => Number(seenTopics.has(a.topic)) - Number(seenTopics.has(b.topic)));
  let marks = 0;
  for (const question of varied) {
    if (marks >= targetMarks && selected.length >= 6) break;
    selected.push(question);
    seenTopics.add(question.topic);
    marks += question.maxMarks;
  }
  return selected.length ? selected : shuffle(questions).slice(0, 10);
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, '0');
  const secs = (safe % 60).toString().padStart(2, '0');
  return hours ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`;
}

export function MockExamBuilder({ apiKey = '' }: { apiKey?: string }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [paper, setPaper] = useState<PaperKind>('paper1');
  const [optionTopic, setOptionTopic] = useState(OPTION_TOPICS[0]);
  const [targetMarks, setTargetMarks] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [rows, setRows] = useState<MarkedRow[]>([]);
  const [error, setError] = useState('');

  const availablePool = useMemo(() => poolForPaper(paper, optionTopic), [paper, optionTopic]);
  const currentQuestion = paperQuestions[currentIndex];
  const totalMarks = paperQuestions.reduce((sum, question) => sum + question.maxMarks, 0);
  const answeredCount = paperQuestions.filter(question => answers[question.id]?.trim()).length;
  const unansweredCount = paperQuestions.length - answeredCount;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aqaPhysicsMockSession') || 'null') as SavedSession | null;
      if (!saved?.active || !Array.isArray(saved.questionIds)) return;
      const restored = saved.questionIds.map(id => questions.find(question => question.id === id)).filter(Boolean) as Question[];
      if (!restored.length) return;
      setPaper(saved.paper);
      setOptionTopic(saved.optionTopic || OPTION_TOPICS[0]);
      setTargetMarks(saved.targetMarks || 50);
      setDurationMinutes(saved.durationMinutes || 60);
      setPaperQuestions(restored);
      setAnswers(saved.answers || {});
      setFlagged(Array.isArray(saved.flagged) ? saved.flagged : []);
      setCurrentIndex(Math.min(saved.currentIndex || 0, restored.length - 1));
      setEndAt(saved.endAt || Date.now());
      setRemaining(Math.max(0, Math.floor(((saved.endAt || Date.now()) - Date.now()) / 1000)));
      setPhase('exam');
    } catch {
      // Resume is optional.
    }
  }, []);

  useEffect(() => {
    if (phase !== 'exam' || !paperQuestions.length) return;
    try {
      const session: SavedSession = {
        active: true,
        paper,
        optionTopic,
        targetMarks,
        durationMinutes,
        questionIds: paperQuestions.map(question => question.id),
        answers,
        flagged,
        currentIndex,
        endAt,
      };
      localStorage.setItem('aqaPhysicsMockSession', JSON.stringify(session));
    } catch {
      // Keep exam usable if storage is unavailable.
    }
  }, [phase, paper, optionTopic, targetMarks, durationMinutes, paperQuestions, answers, flagged, currentIndex, endAt]);

  useEffect(() => {
    if (phase !== 'exam' || !endAt) return;
    const tick = () => setRemaining(Math.max(0, Math.floor((endAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [phase, endAt]);

  const startExam = () => {
    const built = buildPaper(availablePool, targetMarks);
    setPaperQuestions(built);
    setAnswers({});
    setFlagged([]);
    setCurrentIndex(0);
    const finish = Date.now() + durationMinutes * 60 * 1000;
    setEndAt(finish);
    setRemaining(durationMinutes * 60);
    setRows([]);
    setError('');
    setPhase('exam');
  };

  const reset = () => {
    if (phase === 'exam' && !window.confirm('End this mock and clear the saved answers?')) return;
    try { localStorage.removeItem('aqaPhysicsMockSession'); } catch { /* optional */ }
    setPhase('setup');
    setPaperQuestions([]);
    setAnswers({});
    setFlagged([]);
    setRows([]);
    setError('');
    setSubmitting(false);
  };

  const toggleFlag = (id: string) => setFlagged(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);

  const markOne = async (question: Question, answer: string): Promise<MarkedRow> => {
    if (!answer.trim()) return { question, answer, result: null };
    let activeKey = apiKey;
    if (!activeKey) {
      try { activeKey = sessionStorage.getItem('aqaPhysicsApiKey') || ''; } catch { activeKey = ''; }
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
        apiKey: activeKey,
      }),
    });
    const data = await response.json();
    if (!response.ok || data?.error) throw new Error(data?.error || `Could not mark ${question.id}.`);
    return { question, answer, result: data as AnalysisResult };
  };

  const submitExam = async () => {
    if (unansweredCount > 0 && !window.confirm(`${unansweredCount} question${unansweredCount === 1 ? '' : 's'} are unanswered. Submit anyway?`)) return;
    setSubmitting(true);
    setError('');
    setSubmitProgress('Preparing examiner report…');
    try {
      const marked: MarkedRow[] = [];
      for (let start = 0; start < paperQuestions.length; start += 3) {
        const batch = paperQuestions.slice(start, start + 3);
        setSubmitProgress(`Marking questions ${start + 1}–${Math.min(start + batch.length, paperQuestions.length)} of ${paperQuestions.length}…`);
        const batchRows = await Promise.all(batch.map(question => markOne(question, answers[question.id] || '')));
        marked.push(...batchRows);
      }
      setRows(marked);
      setPhase('results');
      try {
        localStorage.removeItem('aqaPhysicsMockSession');
        const score = marked.reduce((sum, row) => sum + (row.result?.marksAwarded || 0), 0);
        const max = marked.reduce((sum, row) => sum + row.question.maxMarks, 0);
        const history = JSON.parse(localStorage.getItem('aqaPhysicsMockHistory') || '[]') as unknown[];
        history.push({ date: new Date().toISOString(), paper, optionTopic: paper === 'paper3b' ? optionTopic : undefined, score, max, percent: max ? Math.round(score / max * 100) : 0 });
        localStorage.setItem('aqaPhysicsMockHistory', JSON.stringify(history.slice(-10)));
      } catch {
        // History is optional.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete mock marking.');
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-5 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 p-1 shadow-xl">
        <div className="rounded-[22px] bg-white p-5 md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><Sparkles size={18} /> Full mock exam builder</div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Build a timed A-level Physics mock</h2>
              <p className="mt-2 max-w-3xl text-slate-600">Create a specification-style mock from the question bank, work through it under timed conditions, flag questions for review, autosave answers and submit the whole session for marking.</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-950"><ShieldCheck size={18} className="mb-1" /><strong>Autosaved</strong><br />Your active mock can resume after a refresh.</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="rounded-2xl border bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-slate-500">Paper style</span><select value={paper} onChange={event => setPaper(event.target.value as PaperKind)} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold"><option value="paper1">Paper 1 core</option><option value="paper2">Paper 2 core</option><option value="paper3a">Paper 3A practical/data</option><option value="paper3b">Paper 3B option</option><option value="mixed">Mixed full course</option></select></label>
            {paper === 'paper3b' ? <label className="rounded-2xl border bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-slate-500">Option</span><select value={optionTopic} onChange={event => setOptionTopic(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold">{OPTION_TOPICS.map(option => <option key={option}>{option}</option>)}</select></label> : <div className="rounded-2xl border bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-slate-500">Question pool</span><div className="mt-2 text-2xl font-extrabold">{availablePool.length}</div><div className="text-xs text-slate-500">eligible bank questions</div></div>}
            <label className="rounded-2xl border bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-slate-500">Target marks</span><select value={targetMarks} onChange={event => setTargetMarks(Number(event.target.value))} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold"><option value={30}>30 marks</option><option value={50}>50 marks</option><option value={70}>70 marks</option><option value={100}>100 marks</option></select></label>
            <label className="rounded-2xl border bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-slate-500">Time limit</span><select value={durationMinutes} onChange={event => setDurationMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border bg-white p-2 text-sm font-semibold"><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-xl border bg-slate-50 p-3 text-sm"><strong>Question navigator</strong><br /><span className="text-slate-500">Jump to any question and see unanswered items.</span></div><div className="rounded-xl border bg-slate-50 p-3 text-sm"><strong>Flag for review</strong><br /><span className="text-slate-500">Mark difficult questions and return before submitting.</span></div><div className="rounded-xl border bg-slate-50 p-3 text-sm"><strong>Whole-session report</strong><br /><span className="text-slate-500">Get question-level marking and an audited total.</span></div></div>
          <Button size="lg" onClick={startExam} disabled={!availablePool.length} className="mt-6 w-full rounded-xl bg-indigo-700 py-6 text-base font-bold hover:bg-indigo-800">Build & start mock</Button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const score = rows.reduce((sum, row) => sum + (row.result?.marksAwarded || 0), 0);
    const max = rows.reduce((sum, row) => sum + row.question.maxMarks, 0);
    const percent = max ? Math.round(score / max * 100) : 0;
    const reviewCount = rows.filter(row => row.result?.reviewRecommended).length;
    return (
      <div className="space-y-5 rounded-3xl border bg-white p-5 shadow-lg md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-sm font-bold uppercase tracking-wider text-indigo-700">Mock exam report</div><h2 className="mt-1 text-3xl font-extrabold">{score}/{max} · {percent}%</h2><p className="mt-1 text-sm text-slate-500">{paper === 'paper3b' ? `${optionTopic} · ` : ''}{answeredCount}/{paperQuestions.length} questions answered · {reviewCount} examiner review flag{reviewCount === 1 ? '' : 's'}</p></div><Button variant="outline" onClick={reset} className="rounded-xl"><RotateCcw size={16} className="mr-2" />Build another mock</Button></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} /></div>
        <div className="space-y-3">{rows.map((row, index) => <details key={row.question.id} className="rounded-2xl border bg-slate-50 p-4"><summary className="cursor-pointer list-none"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="truncate font-bold">{row.question.topic} · {row.question.subTopic}</div><div className="text-xs text-slate-500">{row.answer.trim() ? 'Answered' : 'Unanswered'}</div></div><div className="text-xl font-extrabold">{row.result?.marksAwarded || 0}/{row.question.maxMarks}</div>{row.result?.reviewRecommended ? <Badge className="bg-amber-500">Review</Badge> : null}</div></summary><div className="mt-4 border-t pt-4"><p className="text-sm font-semibold">{row.question.prompt}</p>{row.result ? <><div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"><div className="font-bold text-emerald-900">Credited</div><ul className="mt-1 list-disc pl-5 text-sm">{row.result.creditedPoints?.map((item, itemIndex) => <li key={itemIndex}>{item.mark}: {item.studentEvidence}</li>)}</ul></div>{row.result.lostMarksAnalysis?.length ? <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3"><div className="font-bold text-amber-950">Marks lost</div><ul className="mt-1 list-disc pl-5 text-sm">{row.result.lostMarksAnalysis.map((item, itemIndex) => <li key={itemIndex}>{item.reason}</li>)}</ul></div> : null}</> : <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">No answer submitted, so this question received 0 marks.</div>}</div></details>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-20 z-30 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 font-bold"><FileText size={17} />Mock exam</div><Badge className="bg-indigo-600">{paper === 'paper1' ? 'Paper 1' : paper === 'paper2' ? 'Paper 2' : paper === 'paper3a' ? 'Paper 3A' : paper === 'paper3b' ? 'Paper 3B' : 'Mixed'}</Badge><div className={`ml-auto flex items-center gap-2 rounded-xl px-3 py-2 font-mono font-bold ${remaining <= 600 ? 'bg-red-600' : 'bg-slate-800'}`}><AlarmClock size={17} />{formatTime(remaining)}</div><Button variant="outline" onClick={reset} className="border-slate-700 bg-transparent text-white hover:bg-slate-800">End mock</Button></div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">{paperQuestions.map((question, index) => { const answered = Boolean(answers[question.id]?.trim()); const isFlagged = flagged.includes(question.id); return <button key={question.id} onClick={() => setCurrentIndex(index)} className={`relative flex h-9 min-w-9 items-center justify-center rounded-lg text-xs font-bold ${currentIndex === index ? 'bg-white text-slate-950' : answered ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`}>{index + 1}{isFlagged ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" /> : null}</button>; })}</div>
      </div>

      {remaining === 0 ? <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><TriangleAlert size={18} className="shrink-0" /><strong>Time is up.</strong> You can still review what is on screen, but submit the paper now for marking.</div> : null}

      {currentQuestion ? <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center gap-2"><Badge className="bg-slate-900">Question {currentIndex + 1}</Badge><Badge variant="outline">{currentQuestion.topic}</Badge><Badge variant="outline">{currentQuestion.maxMarks} marks</Badge><Badge variant="outline">{currentQuestion.difficulty}</Badge></div>
          <p className="mt-5 text-xl font-semibold leading-relaxed text-slate-950">{currentQuestion.prompt}</p>
          <textarea value={answers[currentQuestion.id] || ''} onChange={event => setAnswers(previous => ({ ...previous, [currentQuestion.id]: event.target.value }))} className="mt-5 min-h-[300px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Write your exam answer here. Show calculation working and units where needed..." />
          <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex(index => Math.max(0, index - 1))}>Previous</Button><Button variant="outline" onClick={() => toggleFlag(currentQuestion.id)} className={flagged.includes(currentQuestion.id) ? 'border-amber-400 bg-amber-50 text-amber-900' : ''}><Flag size={15} className="mr-2" />{flagged.includes(currentQuestion.id) ? 'Flagged' : 'Flag for review'}</Button><Button disabled={currentIndex === paperQuestions.length - 1} onClick={() => setCurrentIndex(index => Math.min(paperQuestions.length - 1, index + 1))}>Next question</Button></div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm"><div className="text-xs font-bold uppercase text-slate-500">Progress</div><div className="mt-2 text-3xl font-extrabold">{answeredCount}/{paperQuestions.length}</div><div className="text-sm text-slate-500">questions answered</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500" style={{ width: `${paperQuestions.length ? answeredCount / paperQuestions.length * 100 : 0}%` }} /></div></div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm"><div className="text-xs font-bold uppercase text-slate-500">Paper total</div><div className="mt-2 text-3xl font-extrabold">{totalMarks}</div><div className="text-sm text-slate-500">available marks</div><div className="mt-3 text-xs text-slate-500">{flagged.length} flagged · {unansweredCount} unanswered</div></div>
          <Button size="lg" onClick={submitExam} disabled={submitting} className="w-full rounded-xl bg-indigo-700 py-6 font-bold hover:bg-indigo-800">{submitting ? submitProgress || 'Marking mock…' : 'Submit whole mock'}</Button>
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
          <div className="flex gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-950"><CheckCircle2 size={16} className="shrink-0" />Answers are saved locally while this mock is active.</div>
        </aside>
      </div> : null}
    </div>
  );
}
