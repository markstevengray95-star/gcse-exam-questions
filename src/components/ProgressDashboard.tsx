"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { getIndicativeGrade, PRACTICE_GRADE_NOTICE } from '@/lib/grading';
import { questions, type Question } from '@/data/questions';
import { specificationPoints } from '@/data/specification';
import type { AttemptHistory, AttemptRecord } from '@/components/PracticeEnhancements';
import { ExaminerTraining } from '@/components/ExaminerTraining';
import { Badge } from '@/components/ui/badge';
import { BookOpenCheck, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend);

type ScoreBucket = { label: string; percent: number; attempted: number };
type PracticeResult = { marks: number; total: number };
type PracticeResults = Record<string, PracticeResult>;

type Props = {
  averagePercent: number;
  earnedMarks: number;
  availableMarks: number;
  attempted: number;
  totalQuestions: number;
  topicScores: ScoreBucket[];
  commandScores: ScoreBucket[];
};

function safeResults(value: string | null): PracticeResults {
  try {
    const parsed = JSON.parse(value || '{}') as Record<string, PracticeResult>;
    return Object.fromEntries(Object.entries(parsed).filter(([, item]) => item && Number.isFinite(item.marks) && Number.isFinite(item.total) && item.total > 0));
  } catch { return {}; }
}

function safeAttempts(value: string | null): AttemptHistory {
  try {
    const parsed = JSON.parse(value || '{}') as AttemptHistory;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function matches(question: Question, terms: string[]) {
  const text = `${question.topic} ${question.subTopic} ${question.prompt} ${question.requiredKeywords.join(' ')}`.toLowerCase();
  return terms.some(term => text.includes(term.toLowerCase()));
}

function mastery(attempted: number, percent: number) {
  if (!attempted) return { label: 'Not started', className: 'bg-gray-100 text-gray-700' };
  if (percent < 50) return { label: 'Learning', className: 'bg-red-100 text-red-800' };
  if (percent < 70) return { label: 'Developing', className: 'bg-amber-100 text-amber-800' };
  if (attempted >= 3 && percent >= 85) return { label: 'Exam ready', className: 'bg-emerald-100 text-emerald-800' };
  return { label: 'Secure', className: 'bg-blue-100 text-blue-800' };
}

function errorCategories(record: AttemptRecord) {
  const text = `${record.misconceptions?.join(' ') || ''} ${record.answerPreview || ''}`.toLowerCase();
  const categories = new Set<string>();
  if (/unit|dimension|newton|joule|volt|metre|second/.test(text)) categories.add('Units / dimensions');
  if (/significant|sig fig|round/.test(text)) categories.add('Significant figures');
  if (/power of ten|10\^|10⁻|prefix|milli|micro|nano|kilo/.test(text)) categories.add('Powers of ten / prefixes');
  if (/equation|formula|relationship|method/.test(text)) categories.add('Equation / method choice');
  if (/arithmetic|algebra|rearrang|calculation/.test(text)) categories.add('Arithmetic / algebra');
  if (/explain|link|cause|because|reason/.test(text)) categories.add('Explanation links');
  if (/graph|gradient|axis|axes|diagram|field line|circuit/.test(text)) categories.add('Graphs / diagrams');
  if (/term|wording|definition|terminology/.test(text)) categories.add('Terminology / definitions');
  if (record.lostMarks > 0 && !categories.size) categories.add('Other lost-mark pattern');
  return [...categories];
}

export function ProgressDashboard({ averagePercent, earnedMarks, availableMarks, attempted, totalQuestions, topicScores, commandScores }: Props) {
  const [savedResults, setSavedResults] = useState<PracticeResults>({});
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory>({});

  useEffect(() => {
    setSavedResults(safeResults(localStorage.getItem('aqaGcseSciencePracticeResults')));
    setAttemptHistory(safeAttempts(localStorage.getItem('aqaGcseScienceAttemptHistory')));
  }, []);

  const grade = getIndicativeGrade(averagePercent);
  const weakestTopic = topicScores.length ? [...topicScores].sort((a, b) => a.percent - b.percent)[0] : null;
  const strongestTopic = topicScores.length ? [...topicScores].sort((a, b) => b.percent - a.percent)[0] : null;
  const weakestCommand = commandScores.length ? [...commandScores].sort((a, b) => a.percent - b.percent)[0] : null;

  const coverage = useMemo(() => specificationPoints.map(point => {
    const matched = questions.filter(question => matches(question, point.match));
    const marked = matched.map(question => savedResults[question.id]).filter(Boolean) as PracticeResult[];
    const earned = marked.reduce((sum, result) => sum + result.marks, 0);
    const available = marked.reduce((sum, result) => sum + result.total, 0);
    const percent = available ? Math.round(earned / available * 100) : 0;
    return { ...point, matched, attempted: marked.length, percent, status: mastery(marked.length, percent) };
  }), [savedResults]);
  const sections = useMemo(() => Array.from(new Set(coverage.map(point => point.section))), [coverage]);

  const errors = useMemo(() => {
    const records = Object.values(attemptHistory).flat();
    const counts = new Map<string, number>();
    let highConfidenceMisses = 0;
    let lostMarks = 0;
    for (const record of records) {
      lostMarks += record.lostMarks || 0;
      if (record.studentConfidence >= 4 && record.total > 0 && record.marks / record.total < 0.6) highConfidenceMisses += 1;
      for (const category of errorCategories(record)) counts.set(category, (counts.get(category) || 0) + 1);
    }
    return { records, lostMarks, highConfidenceMisses, categories: [...counts.entries()].sort((a, b) => b[1] - a[1]) };
  }, [attemptHistory]);

  const launchQuestion = (question: Question) => {
    localStorage.setItem('aqaGcseScienceSelectedQuestion', question.id);
    localStorage.setItem('aqaGcseScienceDraftAnswer', '');
    window.location.reload();
  };

  const topicData = { labels: topicScores.map(item => item.label), datasets: [{ label: 'Average score (%)', data: topicScores.map(item => item.percent) }] };
  const commandData = { labels: commandScores.map(item => item.label), datasets: [{ label: 'Command-word score (%)', data: commandScores.map(item => item.percent), borderWidth: 2 }] };

  return (
    <div className="space-y-8 p-1 md:p-6">
      {!attempted ? <div className="rounded-xl border border-dashed bg-white p-6 text-center"><h2 className="text-2xl font-bold">Your dashboard is ready</h2><p className="mt-2 text-gray-600">You have no marked bank questions yet, but you can still use the specification map and examiner training below.</p></div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase text-gray-500">Practice band</div><div className="mt-1 text-4xl font-extrabold text-blue-700">{attempted ? grade.grade : '—'}</div><div className="text-sm text-gray-600">{attempted ? `${averagePercent}% overall` : 'Start practising'}</div></div>
        <div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase text-gray-500">Recorded marks</div><div className="mt-1 text-3xl font-bold">{earnedMarks}/{availableMarks}</div><div className="text-sm text-gray-600">Across marked bank questions</div></div>
        <div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase text-gray-500">Question coverage</div><div className="mt-1 text-3xl font-bold">{attempted}/{totalQuestions}</div><div className="text-sm text-gray-600">Question bank attempted</div></div>
        <div className="rounded-lg border bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase text-gray-500">High-confidence misses</div><div className="mt-1 text-3xl font-bold text-amber-700">{errors.highConfidenceMisses}</div><div className="text-sm text-gray-600">Confident answers scoring below 60%</div></div>
      </div>
      <p className="text-xs text-gray-500">{PRACTICE_GRADE_NOTICE}</p>

      {attempted ? <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-4 text-xl font-bold text-slate-800">Topic performance</h3><Bar data={topicData} options={{ responsive: true, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }} /></div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-4 text-xl font-bold text-slate-800">Command-word proficiency</h3>{commandScores.length >= 3 ? <Radar data={commandData} options={{ responsive: true, scales: { r: { min: 0, max: 100 } } }} /> : <div className="flex min-h-64 items-center justify-center rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">Attempt questions using at least three different command words to build this chart.</div>}</div>
      </div> : null}

      <div className="rounded-lg border border-indigo-200 bg-slate-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-indigo-800">Adaptive revision priorities</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4"><div className="text-xs font-bold uppercase text-red-700">Priority topic</div><div className="mt-1 font-bold">{weakestTopic?.label ?? 'More data needed'}</div><div className="text-sm text-gray-600">{weakestTopic ? `${weakestTopic.percent}% across ${weakestTopic.attempted} marked question${weakestTopic.attempted === 1 ? '' : 's'}.` : 'Mark more questions.'}</div></div>
          <div className="rounded-lg bg-white p-4"><div className="text-xs font-bold uppercase text-amber-700">Technique priority</div><div className="mt-1 font-bold">{weakestCommand?.label ?? errors.categories[0]?.[0] ?? 'More data needed'}</div><div className="text-sm text-gray-600">{weakestCommand ? `${weakestCommand.percent}% average. Practise this command word deliberately.` : errors.categories[0] ? `${errors.categories[0][1]} attempts show this error pattern.` : 'Try a wider mix of question styles.'}</div></div>
          <div className="rounded-lg bg-white p-4"><div className="text-xs font-bold uppercase text-green-700">Current strength</div><div className="mt-1 font-bold">{strongestTopic?.label ?? 'More data needed'}</div><div className="text-sm text-gray-600">{strongestTopic ? `${strongestTopic.percent}% average. Keep this topic active with harder questions.` : 'Mark more questions.'}</div></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="flex items-center gap-2"><BookOpenCheck size={20} /><h2 className="text-xl font-bold">AQA GCSE Science specification coverage map</h2></div><p className="mt-1 text-sm text-gray-500">See what you have actually practised and jump straight into weak or untouched specification areas.</p></div><Badge variant="outline">{coverage.filter(point => point.attempted).length}/{coverage.length} areas attempted</Badge></div>
        <div className="mt-5 space-y-6">
          {sections.map(section => <div key={section}><h3 className="mb-2 font-bold">{section}</h3><div className="grid gap-2 md:grid-cols-2">{coverage.filter(point => point.section === section).map(point => {
            const target = point.matched.find(question => !savedResults[question.id]) || point.matched[0];
            return <button key={point.id} type="button" disabled={!target} onClick={() => target && launchQuestion(target)} className="rounded-lg border p-3 text-left hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"><div className="flex items-start justify-between gap-2"><span className="font-semibold">{point.label}</span><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${point.status.className}`}>{point.status.label}</span></div><div className="mt-2 text-xs text-gray-500">{point.year} · {point.attempted} marked · {point.attempted ? `${point.percent}%` : 'not attempted'} · {point.matched.length} bank match{point.matched.length === 1 ? '' : 'es'}</div></button>;
          })}</div></div>)}
        </div>
      </div>

      <ExaminerTraining />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Personal error analytics</h2><p className="mt-1 text-sm text-gray-500">Patterns are inferred from your saved misconceptions, confidence and lost marks.</p>
        <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded border bg-slate-50 p-3"><div className="text-xs text-gray-500">Saved attempts</div><div className="text-2xl font-bold">{errors.records.length}</div></div><div className="rounded border bg-red-50 p-3"><div className="text-xs text-red-700">Lost marks recorded</div><div className="text-2xl font-bold text-red-800">{errors.lostMarks}</div></div></div>
        {errors.categories.length ? <div className="mt-5 space-y-3">{errors.categories.slice(0, 8).map(([category, count]) => { const max = Math.max(...errors.categories.map(item => item[1]), 1); return <div key={category}><div className="mb-1 flex justify-between text-sm font-semibold"><span>{category}</span><span>{count}</span></div><div className="h-2 rounded bg-gray-100"><div className="h-2 rounded bg-blue-600" style={{ width: `${Math.round(count / max * 100)}%` }} /></div></div>; })}</div> : <div className="mt-4 rounded border bg-slate-50 p-4 text-sm">Mark more answers to build your error profile.</div>}
        {errors.categories[0] ? <div className="mt-5 flex gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><div><strong>Most common pattern:</strong> {errors.categories[0][0]} ({errors.categories[0][1]} attempt{errors.categories[0][1] === 1 ? '' : 's'}). Target this deliberately in your next session.</div></div> : null}
      </div>
    </div>
  );
}
