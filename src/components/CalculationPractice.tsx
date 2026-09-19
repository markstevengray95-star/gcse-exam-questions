"use client";

import { useEffect, useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, CheckCircle2, RefreshCw, Sigma, Target, TriangleAlert } from 'lucide-react';

type Stats = { attempts: number; earned: number; available: number; fullMarks: number };

const EMPTY_STATS: Stats = { attempts: 0, earned: 0, available: 0, fullMarks: 0 };

function loadStats(): Stats {
  try {
    const parsed = JSON.parse(localStorage.getItem('aqaGcseScienceCalculationStats') || '{}') as Partial<Stats>;
    return {
      attempts: Number(parsed.attempts) || 0,
      earned: Number(parsed.earned) || 0,
      available: Number(parsed.available) || 0,
      fullMarks: Number(parsed.fullMarks) || 0,
    };
  } catch {
    return EMPTY_STATS;
  }
}

function calculationPool() {
  return questions.filter(question => question.commandWord === 'Calculate' || question.questionType === 'Short calculation');
}

export function CalculationPractice({ apiKey = '' }: { apiKey?: string }) {
  const pool = useMemo(calculationPool, []);
  const topics = useMemo(() => Array.from(new Set(pool.map(question => question.topic))).sort(), [pool]);
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [question, setQuestion] = useState<Question>(pool[0] || questions[0]);
  const [equation, setEquation] = useState('');
  const [working, setWorking] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  useEffect(() => setStats(loadStats()), []);

  const filtered = useMemo(() => pool.filter(item =>
    (topic === 'all' || item.topic === topic) &&
    (difficulty === 'all' || item.difficulty === difficulty),
  ), [pool, topic, difficulty]);

  const chooseQuestion = () => {
    const source = filtered.length ? filtered : pool;
    const alternatives = source.filter(item => item.id !== question.id);
    const nextPool = alternatives.length ? alternatives : source;
    if (!nextPool.length) return;
    setQuestion(nextPool[Math.floor(Math.random() * nextPool.length)]);
    setEquation('');
    setWorking('');
    setFinalAnswer('');
    setResult(null);
    setError('');
    setShowHint(false);
  };

  useEffect(() => {
    const source = filtered.length ? filtered : pool;
    if (source.length && !source.some(item => item.id === question.id)) {
      setQuestion(source[0]);
      setEquation('');
      setWorking('');
      setFinalAnswer('');
      setResult(null);
    }
  }, [filtered, pool, question.id]);

  const mark = async () => {
    if (!equation.trim() && !working.trim() && !finalAnswer.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let activeKey = apiKey;
      if (!activeKey) {
        try { activeKey = sessionStorage.getItem('aqaGcseScienceApiKey') || ''; } catch { activeKey = ''; }
      }
      const studentAnswer = [
        equation.trim() ? `Equation / method: ${equation.trim()}` : '',
        working.trim() ? `Substitution / working: ${working.trim()}` : '',
        finalAnswer.trim() ? `Final answer: ${finalAnswer.trim()}` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer,
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
      if (!response.ok || data?.error) throw new Error(data?.error || 'Could not mark this calculation.');
      const marked = data as AnalysisResult;
      setResult(marked);
      setStats(previous => {
        const next = {
          attempts: previous.attempts + 1,
          earned: previous.earned + marked.marksAwarded,
          available: previous.available + marked.totalMarks,
          fullMarks: previous.fullMarks + (marked.marksAwarded === marked.totalMarks ? 1 : 0),
        };
        try { localStorage.setItem('aqaGcseScienceCalculationStats', JSON.stringify(next)); } catch { /* optional */ }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark this calculation.');
    } finally {
      setLoading(false);
    }
  };

  const average = stats.available ? Math.round(stats.earned / stats.available * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 shadow-sm">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-700"><Calculator size={18} /> Calculation practice</div>
            <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Practise the whole calculation chain</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Separate the equation, substitution and final answer so the examiner can identify exactly where a mark was gained or lost.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border bg-white px-3 py-2"><div className="text-xl font-extrabold">{stats.attempts}</div><div className="text-[10px] uppercase text-slate-500">Attempts</div></div>
            <div className="rounded-xl border bg-white px-3 py-2"><div className="text-xl font-extrabold text-cyan-700">{average}%</div><div className="text-[10px] uppercase text-slate-500">Average</div></div>
            <div className="rounded-xl border bg-white px-3 py-2"><div className="text-xl font-extrabold text-emerald-700">{stats.fullMarks}</div><div className="text-[10px] uppercase text-slate-500">Full marks</div></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3 shadow-sm">
        <select value={topic} onChange={event => setTopic(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium">
          <option value="all">All calculation topics</option>
          {topics.map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium">
          <option value="all">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <Button variant="outline" onClick={chooseQuestion} className="rounded-xl"><RefreshCw size={15} className="mr-2" />New calculation</Button>
        <Badge variant="outline" className="ml-auto self-center">{filtered.length || pool.length} available</Badge>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-cyan-700">{question.topic}</Badge>
          <Badge variant="outline">{question.subTopic}</Badge>
          <Badge variant="outline">{question.maxMarks} marks</Badge>
          <Badge variant="outline">{question.difficulty}</Badge>
        </div>
        <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-950">{question.prompt}</p>
        <button type="button" onClick={() => setShowHint(value => !value)} className="mt-3 text-sm font-semibold text-cyan-700 hover:underline">{showHint ? 'Hide hint' : 'Show hint'}</button>
        {showHint ? <div className="mt-2 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-950">{question.hint}</div> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="rounded-2xl border bg-white p-4 shadow-sm"><span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Sigma size={16} />1. Equation / method</span><textarea value={equation} onChange={event => setEquation(event.target.value)} className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Write the equation and any rearrangement..." /></label>
        <label className="rounded-2xl border bg-white p-4 shadow-sm"><span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Target size={16} />2. Substitute & work</span><textarea value={working} onChange={event => setWorking(event.target.value)} className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Show conversions, substitution and arithmetic..." /></label>
        <label className="rounded-2xl border bg-white p-4 shadow-sm"><span className="flex items-center gap-2 text-sm font-bold text-slate-800"><CheckCircle2 size={16} />3. Final answer</span><textarea value={finalAnswer} onChange={event => setFinalAnswer(event.target.value)} className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Answer with units and suitable significant figures..." /></label>
      </div>

      {error ? <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert size={17} className="mt-0.5 shrink-0" />{error}</div> : null}

      <Button size="lg" onClick={mark} disabled={loading || (!equation.trim() && !working.trim() && !finalAnswer.trim())} className="w-full rounded-xl bg-cyan-700 py-6 text-base font-bold hover:bg-cyan-800">{loading ? 'Checking method, units and answer…' : 'Mark this calculation'}</Button>

      {result ? (
        <div className="space-y-4 rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-sm font-bold uppercase tracking-wider text-cyan-700">Calculation result</div><div className="mt-1 text-4xl font-extrabold">{result.marksAwarded}<span className="text-xl text-slate-400">/{result.totalMarks}</span></div></div><Button onClick={chooseQuestion} className="rounded-xl">Next calculation</Button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><div className="font-bold text-emerald-900">Credited method / accuracy</div>{result.creditedPoints?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-950">{result.creditedPoints.map((item, index) => <li key={index}>{item.mark}: {item.studentEvidence}</li>)}</ul> : <p className="mt-2 text-sm">No mark points were credited yet.</p>}</div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4"><div className="font-bold text-amber-950">What to fix</div>{result.lostMarksAnalysis?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-950">{result.lostMarksAnalysis.map((item, index) => <li key={index}>{item.reason} — {item.improvementSuggestion}</li>)}</ul> : <p className="mt-2 text-sm">No lost-mark issue was recorded.</p>}</div>
          </div>
          {result.sigFigUnitAudit?.length ? <div className="rounded-xl border bg-slate-50 p-4"><div className="font-bold">Units & significant figures audit</div><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{result.sigFigUnitAudit.map((item, index) => <li key={index}>{item.issue}: {item.suggestion}</li>)}</ul></div> : null}
          <details className="rounded-xl border bg-slate-50 p-4"><summary className="cursor-pointer font-bold">Show full-mark solution</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{result.modelAnswer || question.modelAnswer}</p></details>
        </div>
      ) : null}
    </div>
  );
}
