"use client";

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { questions } from '@/data/questions';
import {
  REVIEW_INTERVAL_DAYS,
  loadMistakeNotebook,
  markMistakeReviewed,
  saveMistakeNotebook,
  type MistakeEntry,
} from '@/lib/mistakeNotebook';
import type { AttemptHistory } from '@/components/PracticeEnhancements';
import { Brain, CheckCircle2, Clock3, RotateCcw, Target, Trash2 } from 'lucide-react';

type Filter = 'due' | 'all' | 'mastered';

type Props = {
  onPracticeQuestion?: (questionId: string) => void;
};

function isDue(entry: MistakeEntry) {
  return !entry.mastered && Boolean(entry.nextReviewAt) && new Date(entry.nextReviewAt as string).getTime() <= Date.now();
}

function addDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function nextLabel(entry: MistakeEntry) {
  if (entry.mastered) return 'Mastered';
  if (!entry.nextReviewAt) return 'No review scheduled';
  const diff = new Date(entry.nextReviewAt).getTime() - Date.now();
  if (diff <= 0) return 'Due now';
  const days = Math.max(1, Math.ceil(diff / 86_400_000));
  return `Due in ${days} day${days === 1 ? '' : 's'}`;
}

function syncAttemptHistory() {
  const existing = loadMistakeNotebook();
  const ids = new Set(existing.map(entry => entry.id));
  let attempts: AttemptHistory = {};
  try {
    const parsed = JSON.parse(localStorage.getItem('aqaGcseScienceAttemptHistory') || '{}') as AttemptHistory;
    if (parsed && typeof parsed === 'object') attempts = parsed;
  } catch {
    attempts = {};
  }

  const added: MistakeEntry[] = [];
  for (const [questionId, records] of Object.entries(attempts)) {
    const question = questions.find(item => item.id === questionId);
    if (!question || !Array.isArray(records)) continue;
    for (const attempt of records) {
      const lostMarks = Math.max(0, Math.round(Number(attempt.lostMarks) || 0));
      if (!lostMarks) continue;
      for (let index = 0; index < lostMarks; index += 1) {
        const id = `history-${attempt.id}-lost-${index + 1}`;
        if (ids.has(id)) continue;
        const misconception = attempt.misconceptions?.[index % Math.max(1, attempt.misconceptions.length)] || '';
        const schemePoint = question.markScheme[Math.min(index, Math.max(0, question.markScheme.length - 1))] || '';
        added.push({
          id,
          questionId,
          questionPrompt: question.prompt,
          topic: question.topic,
          subTopic: question.subTopic,
          createdAt: attempt.createdAt,
          nextReviewAt: addDays(attempt.createdAt, REVIEW_INTERVAL_DAYS[0]),
          reviewStage: 0,
          reviewCount: 0,
          mastered: false,
          marksAwarded: attempt.marks,
          totalMarks: attempt.total,
          lostMarkNumber: index + 1,
          reason: misconception ? `Misconception flagged: ${misconception}` : `This response lost mark ${index + 1} of ${lostMarks}.`,
          improvement: schemePoint ? `Revisit this mark-scheme requirement: ${schemePoint}` : 'Compare your response with the full-mark answer and identify the missing science statement, calculation step or unit.',
          correction: question.modelAnswer,
          misconceptions: attempt.misconceptions || [],
          studentAnswerPreview: attempt.answerPreview || '',
        });
        ids.add(id);
      }
    }
  }

  if (!added.length) return existing;
  const next = [...existing, ...added].slice(-500);
  saveMistakeNotebook(next);
  return next;
}

export function MistakeNotebook({ onPracticeQuestion }: Props) {
  const [entries, setEntries] = useState<MistakeEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('due');
  const [topic, setTopic] = useState('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const refresh = () => setEntries(syncAttemptHistory());

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('aqaGcseScienceMistakesUpdated', onUpdate);
    return () => window.removeEventListener('aqaGcseScienceMistakesUpdated', onUpdate);
  }, []);

  const topics = useMemo(() => Array.from(new Set(entries.map(entry => entry.topic))).sort(), [entries]);
  const dueCount = entries.filter(isDue).length;
  const activeCount = entries.filter(entry => !entry.mastered).length;
  const masteredCount = entries.filter(entry => entry.mastered).length;

  const visible = useMemo(() => entries
    .filter(entry => topic === 'all' || entry.topic === topic)
    .filter(entry => filter === 'all' || (filter === 'mastered' ? entry.mastered : isDue(entry)))
    .sort((a, b) => {
      if (a.mastered !== b.mastered) return a.mastered ? 1 : -1;
      return new Date(a.nextReviewAt || a.createdAt).getTime() - new Date(b.nextReviewAt || b.createdAt).getTime();
    }), [entries, filter, topic]);

  const updateEntry = (id: string, updater: (entry: MistakeEntry) => MistakeEntry) => {
    const next = entries.map(entry => entry.id === id ? updater(entry) : entry);
    setEntries(next);
    saveMistakeNotebook(next);
  };

  const removeEntry = (id: string) => {
    const next = entries.filter(entry => entry.id !== id);
    setEntries(next);
    saveMistakeNotebook(next);
  };

  const clearMastered = () => {
    if (!window.confirm('Remove all mastered mistake cards?')) return;
    const next = entries.filter(entry => !entry.mastered);
    setEntries(next);
    saveMistakeNotebook(next);
  };

  const practiseQuestion = (questionId: string) => {
    if (onPracticeQuestion) {
      onPracticeQuestion(questionId);
      return;
    }
    try {
      localStorage.setItem('aqaGcseScienceSelectedQuestion', questionId);
      localStorage.setItem('aqaGcseScienceDraftAnswer', '');
    } catch {
      // Reload still takes the user back to practice even if storage is blocked.
    }
    window.location.reload();
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-700"><Brain size={17} /> Mistake notebook</div>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Turn lost marks into scheduled revision</h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">Every recorded lost mark is converted into a revision card with the original question, misconception or mark-scheme gap, full-mark reference and a 1 → 3 → 7 → 14 day spaced-repetition schedule.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2"><div className="text-xl font-extrabold text-rose-800">{dueCount}</div><div className="text-[11px] font-bold uppercase text-rose-600">Due</div></div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2"><div className="text-xl font-extrabold text-blue-800">{activeCount}</div><div className="text-[11px] font-bold uppercase text-blue-600">Active</div></div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"><div className="text-xl font-extrabold text-emerald-800">{masteredCount}</div><div className="text-[11px] font-bold uppercase text-emerald-600">Mastered</div></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-slate-50 p-3">
        {(['due', 'all', 'mastered'] as Filter[]).map(value => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-bold capitalize ${filter === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>{value}</button>
        ))}
        <select value={topic} onChange={event => setTopic(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Filter mistakes by topic">
          <option value="all">All topics</option>
          {topics.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        {masteredCount ? <Button variant="outline" size="sm" className="ml-auto" onClick={clearMastered}><Trash2 size={14} className="mr-1" />Clear mastered</Button> : null}
      </div>

      {!entries.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Target className="mx-auto h-10 w-10 text-slate-400" />
          <h4 className="mt-3 text-lg font-bold">No mistakes saved yet</h4>
          <p className="mt-1 text-sm text-slate-500">Complete and mark a practice question. Any lost marks will appear here automatically when you open the notebook.</p>
        </div>
      ) : !visible.length ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-900">Nothing matches this view. If your due list is empty, you are caught up for now.</div>
      ) : (
        <div className="space-y-3">
          {visible.map(entry => {
            const bankQuestion = questions.find(question => question.id === entry.questionId);
            const stage = Math.min(entry.reviewStage, REVIEW_INTERVAL_DAYS.length - 1);
            return (
              <div key={entry.id} className={`rounded-2xl border p-4 ${entry.mastered ? 'border-emerald-200 bg-emerald-50/40' : isDue(entry) ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{entry.topic}</Badge><Badge variant="outline">{entry.subTopic}</Badge><span className="text-xs text-slate-500">Lost mark {entry.lostMarkNumber} · scored {entry.marksAwarded}/{entry.totalMarks}</span></div>
                    <p className="mt-3 font-semibold leading-relaxed text-slate-950">{entry.questionPrompt}</p>
                    <div className="mt-3 rounded-xl border border-rose-100 bg-white p-3"><div className="text-xs font-bold uppercase text-rose-700">Why the mark was lost</div><p className="mt-1 text-sm text-slate-800">{entry.reason}</p></div>
                    <div className="mt-2 rounded-xl border border-blue-100 bg-white p-3"><div className="text-xs font-bold uppercase text-blue-700">What to change next time</div><p className="mt-1 text-sm text-slate-800">{entry.improvement}</p></div>
                    {entry.misconceptions.length ? <div className="mt-2 flex flex-wrap gap-1">{entry.misconceptions.map((item, index) => <span key={`${item}-${index}`} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{item}</span>)}</div> : null}
                    <button type="button" onClick={() => setExpanded(previous => ({ ...previous, [entry.id]: !previous[entry.id] }))} className="mt-3 text-sm font-bold text-indigo-700 hover:underline">{expanded[entry.id] ? 'Hide correction' : 'Show correction / full-mark reference'}</button>
                    {expanded[entry.id] ? <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm leading-relaxed text-indigo-950">{entry.correction}</div> : null}
                  </div>

                  <div className="min-w-[180px] rounded-xl border bg-white p-3 text-sm">
                    <div className="flex items-center gap-2 font-bold"><Clock3 size={15} />{nextLabel(entry)}</div>
                    <div className="mt-2 text-xs text-slate-500">Reviews completed: {entry.reviewCount}</div>
                    {!entry.mastered ? <div className="mt-1 text-xs text-slate-500">Next interval after success: {REVIEW_INTERVAL_DAYS[Math.min(stage + 1, REVIEW_INTERVAL_DAYS.length - 1)]} days</div> : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                  {bankQuestion ? <Button size="sm" variant="outline" onClick={() => practiseQuestion(entry.questionId)}><RotateCcw size={14} className="mr-1" />Practise question again</Button> : null}
                  {!entry.mastered ? <>
                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => updateEntry(entry.id, item => markMistakeReviewed(item, true))}><CheckCircle2 size={14} className="mr-1" />Reviewed — got it</Button>
                    <Button size="sm" variant="outline" onClick={() => updateEntry(entry.id, item => markMistakeReviewed(item, false))}>Still unsure — tomorrow</Button>
                  </> : null}
                  <Button size="sm" variant="ghost" className="ml-auto text-slate-500" onClick={() => removeEntry(entry.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
