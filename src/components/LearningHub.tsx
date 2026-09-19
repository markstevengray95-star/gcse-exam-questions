"use client";

import { useEffect, useMemo, useState } from 'react';
import { questions, type Question } from '@/data/questions';
import { specificationPoints } from '@/data/specification';
import { getIndicativeGrade, PRACTICE_GRADE_NOTICE } from '@/lib/grading';
import { CalculationPractice } from '@/components/CalculationPractice';
import { MockExamBuilder } from '@/components/MockExamBuilder';
import { MistakeNotebook } from '@/components/MistakeNotebook';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  Beaker,
  BookOpenCheck,
  Brain,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  GraduationCap,
  ListChecks,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

type PracticeResult = { marks: number; total: number };
type PracticeResults = Record<string, PracticeResult>;
type Attempt = {
  createdAt?: string;
  marks?: number;
  total?: number;
  misconceptions?: string[];
  lostMarks?: number;
  studentConfidence?: number;
};
type AttemptHistory = Record<string, Attempt[]>;
type HubTab = 'overview' | 'adaptive' | 'practicals' | 'calculations' | 'mock' | 'mistakes' | 'skills';

function safeJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null') as T | null;
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function pctFor(items: Question[], results: PracticeResults) {
  const marked = items.map(item => results[item.id]).filter(Boolean);
  const earned = marked.reduce((sum, item) => sum + item.marks, 0);
  const total = marked.reduce((sum, item) => sum + item.total, 0);
  return { attempted: marked.length, earned, total, percent: total ? Math.round(earned / total * 100) : 0 };
}

function masteryLabel(percent: number, attempted: number) {
  if (!attempted) return { label: 'Not started', cls: 'bg-slate-100 text-slate-700' };
  if (percent < 50) return { label: 'Red', cls: 'bg-red-100 text-red-800' };
  if (percent < 70) return { label: 'Amber', cls: 'bg-amber-100 text-amber-800' };
  return { label: 'Green', cls: 'bg-emerald-100 text-emerald-800' };
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function dayDiff(from: Date, to: Date) {
  return Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

function streakFromAttempts(history: AttemptHistory) {
  const days = new Set(
    Object.values(history).flat()
      .map(item => item.createdAt)
      .filter(Boolean)
      .map(value => startOfDay(new Date(value as string)).toISOString().slice(0, 10)),
  );
  if (!days.size) return 0;
  let streak = 0;
  const cursor = startOfDay(new Date());
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  if (streak === 0) {
    cursor.setTime(startOfDay(new Date()).getTime());
    cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  return streak;
}

const COMMAND_HELP: Record<string, string> = {
  Calculate: 'Show the equation, substitution, working and final answer with a unit.',
  Explain: 'State what happens, then link it to the scientific reason using because / therefore.',
  Describe: 'State the pattern or feature you can observe. Do not add a reason unless asked.',
  Compare: 'Give linked similarities and differences. Use both items in each comparison.',
  Evaluate: 'Use evidence for strengths and limitations, then make a justified judgement.',
  Suggest: 'Apply your science knowledge to the unfamiliar context and give a plausible reason.',
  Determine: 'Use the information provided to work out a value or conclusion.',
};

function commandAdvice(commandWord: string) {
  return COMMAND_HELP[commandWord] || 'Answer the exact command word and make each scientific marking point explicit.';
}

export function LearningHub({
  apiKey = '',
  onPracticeQuestion,
}: {
  apiKey?: string;
  onPracticeQuestion?: (questionId: string) => void;
}) {
  const [tab, setTab] = useState<HubTab>('overview');
  const [results, setResults] = useState<PracticeResults>({});
  const [attempts, setAttempts] = useState<AttemptHistory>({});
  const [examDate, setExamDate] = useState('');
  const [sixMarkId, setSixMarkId] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setResults(safeJson('aqaGcseSciencePracticeResults', {}));
    setAttempts(safeJson('aqaGcseScienceAttemptHistory', {}));
    setExamDate(localStorage.getItem('aqaGcseScienceExamDate') || '');
  }, [refresh]);

  const bySubject = useMemo(() => ['Biology', 'Chemistry', 'Physics'].map(subject => ({
    subject,
    ...pctFor(questions.filter(q => q.subject === subject), results),
  })), [results]);

  const topicPerformance = useMemo(() => {
    const topics = Array.from(new Set(questions.map(q => q.topic)));
    return topics.map(topic => ({
      topic,
      ...pctFor(questions.filter(q => q.topic === topic), results),
    })).sort((a, b) => {
      if (!a.attempted && b.attempted) return -1;
      if (a.attempted && !b.attempted) return 1;
      return a.percent - b.percent;
    });
  }, [results]);

  const weakTopics = topicPerformance.filter(item => !item.attempted || item.percent < 70).slice(0, 6);
  const strongTopics = [...topicPerformance].filter(item => item.attempted).sort((a, b) => b.percent - a.percent).slice(0, 3);

  const adaptivePool = useMemo(() => {
    const weakNames = new Set(weakTopics.map(item => item.topic));
    const pool = questions.filter(q => weakNames.has(q.topic) || !results[q.id] || (results[q.id]?.marks || 0) / Math.max(1, results[q.id]?.total || 1) < 0.7);
    return pool.length ? pool : questions;
  }, [results, weakTopics]);

  const questionOfDay = useMemo(() => {
    const today = new Date();
    const index = Math.abs(Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000)) % questions.length;
    return questions[index];
  }, []);

  const practicalQuestions = questions.filter(q => q.topic.toLowerCase().includes('required practical'));
  const sixMarkers = questions.filter(q => q.maxMarks >= 6 || q.questionType.includes('6-mark'));
  const selectedSixMark = sixMarkers.find(q => q.id === sixMarkId) || sixMarkers[0];

  const mathsGroups = useMemo(() => {
    const groups = [
      { label: 'Biology maths', items: questions.filter(q => q.subject === 'Biology' && q.commandWord === 'Calculate') },
      { label: 'Chemistry maths', items: questions.filter(q => q.subject === 'Chemistry' && q.commandWord === 'Calculate') },
      { label: 'Physics maths', items: questions.filter(q => q.subject === 'Physics' && q.commandWord === 'Calculate') },
      { label: 'Graphs & data', items: questions.filter(q => /graph|data|gradient|rate|percentage/i.test(`${q.subTopic} ${q.prompt}`)) },
    ];
    return groups.map(group => ({ ...group, ...pctFor(group.items, results) }));
  }, [results]);

  const commandPerformance = useMemo(() => {
    const commands = Array.from(new Set(questions.map(q => q.commandWord)));
    return commands.map(command => ({
      command,
      ...pctFor(questions.filter(q => q.commandWord === command), results),
    })).sort((a, b) => {
      if (!a.attempted && b.attempted) return -1;
      if (a.attempted && !b.attempted) return 1;
      return a.percent - b.percent;
    });
  }, [results]);

  const lostMarks = Object.values(attempts).flat().reduce((sum, item) => sum + (Number(item.lostMarks) || 0), 0);
  const misconceptionCount = Object.values(attempts).flat().reduce((sum, item) => sum + (item.misconceptions?.length || 0), 0);
  const streak = streakFromAttempts(attempts);
  const attemptedCount = Object.keys(results).length;
  const fullMarksCount = Object.entries(results).filter(([, item]) => item.total > 0 && item.marks === item.total).length;

  const overall = pctFor(questions, results);
  const overallGrade = getIndicativeGrade(overall.percent);
  const daysToExam = examDate ? dayDiff(new Date(), new Date(`${examDate}T12:00:00`)) : null;

  const achievements = [
    { name: 'First mark', earned: attemptedCount >= 1, detail: 'Complete your first marked bank question.' },
    { name: 'Ten-question scientist', earned: attemptedCount >= 10, detail: 'Complete 10 marked bank questions.' },
    { name: 'Full-mark finisher', earned: fullMarksCount >= 3, detail: 'Get full marks on three questions.' },
    { name: 'Three-day streak', earned: streak >= 3, detail: 'Practise on three consecutive days.' },
    { name: 'Practical ready', earned: pctFor(practicalQuestions, results).attempted >= 3, detail: 'Attempt all three science practical areas.' },
  ];

  const revisionPlan = useMemo(() => {
    const priorities = weakTopics.length ? weakTopics : topicPerformance.slice(0, 6);
    return Array.from({ length: 7 }, (_, index) => {
      const target = priorities[index % Math.max(1, priorities.length)];
      const action = index % 3 === 0 ? 'Learn + recall' : index % 3 === 1 ? 'Exam questions' : 'Retest + correct mistakes';
      return { day: index + 1, topic: target?.topic || 'Mixed science', action };
    });
  }, [topicPerformance, weakTopics]);

  const launch = (question?: Question) => {
    if (!question) return;
    onPracticeQuestion?.(question.id);
  };

  const launchAdaptive = () => {
    const unattempted = adaptivePool.filter(q => !results[q.id]);
    const pool = unattempted.length ? unattempted : adaptivePool;
    launch(pool[Math.floor(Math.random() * pool.length)]);
  };

  const nav = [
    ['overview', 'Overview', TrendingUp],
    ['adaptive', 'Adaptive revision', Brain],
    ['practicals', 'Required practicals', FlaskConical],
    ['calculations', 'Calculations', Calculator],
    ['mock', 'Mock exam', GraduationCap],
    ['mistakes', 'Mistake notebook', RefreshCw],
    ['skills', 'Exam skills', ListChecks],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-blue-700">Student learning hub</div>
            <h2 className="mt-1 text-2xl font-extrabold">GCSE Science revision workspace</h2>
            <p className="mt-1 text-sm text-gray-600">Adaptive practice, required practicals, calculations, mocks, spaced repetition and exam technique in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={launchAdaptive}><Target size={16} /> Start best next question</Button>
            <Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Refresh progress</Button>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {nav.map(([value, label, Icon]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${tab === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase text-gray-500">Overall practice band</div><div className="mt-1 text-4xl font-black text-blue-700">{overall.attempted ? overallGrade.grade : '—'}</div><div className="text-sm text-gray-600">{overall.attempted ? `${overall.percent}% across ${overall.attempted} questions` : 'Start practising to build a band.'}</div></div>
            <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase text-gray-500">Practice streak</div><div className="mt-1 text-4xl font-black">{streak}</div><div className="text-sm text-gray-600">day{streak === 1 ? '' : 's'} active</div></div>
            <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase text-gray-500">Full-mark answers</div><div className="mt-1 text-4xl font-black text-emerald-700">{fullMarksCount}</div><div className="text-sm text-gray-600">bank questions at 100%</div></div>
            <div className="rounded-xl border bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase text-gray-500">Lost marks logged</div><div className="mt-1 text-4xl font-black text-amber-700">{lostMarks}</div><div className="text-sm text-gray-600">{misconceptionCount} misconception flags</div></div>
          </div>
          <p className="text-xs text-gray-500">{PRACTICE_GRADE_NOTICE}</p>

          <div className="grid gap-4 md:grid-cols-3">
            {bySubject.map(item => {
              const band = getIndicativeGrade(item.percent);
              return <div key={item.subject} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{item.subject}</h3><Badge variant="outline">{item.attempted ? `Band ${band.grade}` : 'Not started'}</Badge></div>
                <div className="mt-3 text-3xl font-black">{item.attempted ? `${item.percent}%` : '—'}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percent}%` }} /></div>
                <div className="mt-2 text-xs text-gray-500">{item.attempted} marked question{item.attempted === 1 ? '' : 's'}</div>
              </div>;
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><CalendarDays size={19} /><h3 className="text-lg font-bold">Exam countdown & 7-day revision plan</h3></div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-sm font-medium">Next science exam<input type="date" value={examDate} onChange={event => { setExamDate(event.target.value); localStorage.setItem('aqaGcseScienceExamDate', event.target.value); }} className="mt-1 block rounded border p-2" /></label>
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  {daysToExam === null ? 'Set an exam date to start the countdown.' : daysToExam < 0 ? 'That exam date has passed.' : daysToExam === 0 ? 'Exam day' : `${daysToExam} day${daysToExam === 1 ? '' : 's'} to go`}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {revisionPlan.map(item => <div key={item.day} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg bg-slate-50 p-3 text-sm"><strong>Day {item.day}</strong><div><span className="font-semibold">{item.topic}</span><span className="text-gray-500"> · {item.action}</span></div></div>)}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2"><Award size={19} /><h3 className="text-lg font-bold">Achievements</h3></div>
              <div className="mt-4 space-y-2">
                {achievements.map(item => <div key={item.name} className={`flex items-start gap-3 rounded-lg border p-3 ${item.earned ? 'border-emerald-200 bg-emerald-50' : 'bg-slate-50'}`}><CheckCircle2 size={18} className={item.earned ? 'text-emerald-600' : 'text-slate-300'} /><div><div className="font-semibold">{item.name}</div><div className="text-xs text-gray-600">{item.detail}</div></div></div>)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div><div className="flex items-center gap-2 font-bold text-indigo-900"><Sparkles size={18} /> Question of the day</div><div className="mt-1 text-sm text-indigo-900">{questionOfDay.subject} · {questionOfDay.topic} · {questionOfDay.maxMarks} marks</div><p className="mt-2 font-semibold">{questionOfDay.prompt}</p></div>
              <Button onClick={() => launch(questionOfDay)}>Attempt question</Button>
            </div>
          </div>
        </>
      ) : null}

      {tab === 'adaptive' ? (
        <div className="space-y-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-bold">Adaptive revision queue</h3><p className="text-sm text-gray-600">Unattempted and low-scoring areas are automatically prioritised.</p></div><Button onClick={launchAdaptive}><Target size={16} /> Give me the best next question</Button></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {weakTopics.map(item => { const status = masteryLabel(item.percent, item.attempted); const target = questions.find(q => q.topic === item.topic && !results[q.id]) || questions.find(q => q.topic === item.topic); return <button key={item.topic} type="button" onClick={() => launch(target)} className="rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"><div className="flex justify-between gap-2"><strong>{item.topic}</strong><span className={`rounded-full px-2 py-1 text-xs font-bold ${status.cls}`}>{status.label}</span></div><div className="mt-2 text-xs text-gray-500">{item.attempted ? `${item.percent}% across ${item.attempted} question${item.attempted === 1 ? '' : 's'}` : 'No marked bank question yet'}</div></button>; })}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {strongTopics.map(item => <div key={item.topic} className="rounded-xl border bg-white p-4"><div className="text-xs font-bold uppercase text-emerald-700">Keep warm</div><div className="mt-1 font-bold">{item.topic}</div><div className="text-sm text-gray-600">{item.percent}% · move to harder/application questions.</div></div>)}
          </div>
        </div>
      ) : null}

      {tab === 'practicals' ? (
        <div className="space-y-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Beaker size={20} /><h3 className="text-xl font-bold">Required practical mode</h3></div>
            <p className="mt-1 text-sm text-gray-600">Practise variables, methods, apparatus, graphs, errors, conclusions and evaluation for Biology, Chemistry and Physics practical work.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {practicalQuestions.map(question => { const result = results[question.id]; const percent = result ? Math.round(result.marks / result.total * 100) : 0; return <button key={question.id} type="button" onClick={() => launch(question)} className="rounded-lg border p-4 text-left hover:border-blue-300 hover:bg-blue-50"><div className="font-bold">{question.subject}</div><div className="mt-1 text-sm">{question.topic}</div><div className="mt-2 text-xs text-gray-500">{result ? `Latest saved result: ${percent}%` : 'Not attempted'}</div></button>; })}
            </div>
          </div>
          <div className="rounded-xl border bg-amber-50 p-5 text-sm"><strong>Practical exam technique:</strong> name the independent, dependent and control variables; state measurements and units; use repeats/means where justified; identify uncertainty or limitations; and make improvements specific to the weakness you identified.</div>
        </div>
      ) : null}

      {tab === 'calculations' ? <CalculationPractice apiKey={apiKey} /> : null}
      {tab === 'mock' ? <MockExamBuilder apiKey={apiKey} /> : null}
      {tab === 'mistakes' ? <MistakeNotebook onPracticeQuestion={onPracticeQuestion} /> : null}

      {tab === 'skills' ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Maths-skills tracker</h3>
              <div className="mt-4 space-y-3">{mathsGroups.map(group => <div key={group.label}><div className="flex justify-between text-sm"><span className="font-semibold">{group.label}</span><span>{group.attempted ? `${group.percent}%` : 'Not started'}</span></div><div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${group.percent}%` }} /></div><div className="mt-1 text-[11px] text-gray-500">{group.attempted} marked question{group.attempted === 1 ? '' : 's'}</div></div>)}</div>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Command-word coach</h3>
              <div className="mt-4 space-y-3">{commandPerformance.slice(0, 7).map(item => <div key={item.command} className="rounded-lg bg-slate-50 p-3"><div className="flex justify-between gap-2"><strong>{item.command}</strong><span className="text-xs">{item.attempted ? `${item.percent}%` : 'Not attempted'}</span></div><p className="mt-1 text-xs text-gray-600">{commandAdvice(item.command)}</p></div>)}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold">6-mark answer builder</h3>
            <p className="mt-1 text-sm text-gray-600">See how a response grows from a single valid point into a linked, full answer. Use this to learn structure, then attempt the question without the scaffold.</p>
            <select value={selectedSixMark?.id || ''} onChange={event => setSixMarkId(event.target.value)} className="mt-4 w-full rounded border p-2 text-sm">
              {sixMarkers.map(q => <option key={q.id} value={q.id}>{q.subject} · {q.topic} — {q.prompt.slice(0, 70)}</option>)}
            </select>
            {selectedSixMark ? <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-red-50 p-4"><div className="text-xs font-bold uppercase text-red-700">Basic response</div><p className="mt-2 text-sm">{selectedSixMark.markScheme[0]?.replace(/^\[[^\]]+\]\s*/, '') || selectedSixMark.modelAnswer}</p></div>
              <div className="rounded-lg border bg-amber-50 p-4"><div className="text-xs font-bold uppercase text-amber-700">Developed response</div><ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{selectedSixMark.markScheme.slice(0, 3).map((point, index) => <li key={index}>{point.replace(/^\[[^\]]+\]\s*/, '')}</li>)}</ul></div>
              <div className="rounded-lg border bg-emerald-50 p-4"><div className="text-xs font-bold uppercase text-emerald-700">Full-mark direction</div><p className="mt-2 text-sm">{selectedSixMark.modelAnswer}</p></div>
            </div> : null}
            <div className="mt-4"><Button onClick={() => launch(selectedSixMark)}>Attempt this 6-marker</Button></div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><BookOpenCheck size={19} /><h3 className="text-lg font-bold">Specification mastery summary</h3></div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {specificationPoints.map(point => {
                const matched = questions.filter(q => q.specificationPointId === point.id || q.topic === point.topic);
                const score = pctFor(matched, results);
                const status = masteryLabel(score.percent, score.attempted);
                const target = matched.find(q => !results[q.id]) || matched[0];
                return <button type="button" key={point.id} onClick={() => launch(target)} disabled={!target} className="rounded-lg border p-3 text-left hover:bg-slate-50 disabled:opacity-50"><div className="flex justify-between gap-2"><span className="font-semibold">{point.label}</span><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${status.cls}`}>{status.label}</span></div><div className="mt-1 text-xs text-gray-500">{point.subject} · {point.paper} · {score.attempted ? `${score.percent}%` : 'not attempted'}</div></button>;
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
