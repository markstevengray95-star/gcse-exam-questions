"use client";

import { useMemo, useState } from 'react';
import type { Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { offlineMark } from '@/lib/offlineMarker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Scale, ShieldCheck, TriangleAlert } from 'lucide-react';

export function MarkReviewTools({
  question,
  result,
  studentAnswer,
  onOverride,
}: {
  question: Question;
  result: AnalysisResult;
  studentAnswer: string;
  onOverride: (marks: number, note: string) => void;
}) {
  const [overrideMarks, setOverrideMarks] = useState(result.marksAwarded);
  const [note, setNote] = useState('');
  const [showTeacher, setShowTeacher] = useState(false);
  const [showMistake, setShowMistake] = useState(false);

  const crossCheck = useMemo(() => {
    if (!studentAnswer.trim()) return null;
    const offline = offlineMark({
      studentAnswer,
      questionPrompt: question.prompt,
      commandWord: question.commandWord,
      questionType: question.questionType,
      subject: question.subject,
      requiredKeywords: question.requiredKeywords,
      maxMarks: question.maxMarks,
      markScheme: question.markScheme,
      modelAnswer: question.modelAnswer,
    }) as AnalysisResult;
    const difference = Math.abs((offline.marksAwarded || 0) - result.marksAwarded);
    return { offline, difference };
  }, [question, result.marksAwarded, studentAnswer]);

  const saveOverride = () => {
    const marks = Math.max(0, Math.min(question.maxMarks, Number(overrideMarks) || 0));
    const entry = {
      questionId: question.id,
      originalMark: result.marksAwarded,
      overrideMark: marks,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      const previous = JSON.parse(localStorage.getItem('aqaGcseScienceTeacherOverrides') || '[]');
      localStorage.setItem('aqaGcseScienceTeacherOverrides', JSON.stringify([entry, ...(Array.isArray(previous) ? previous : [])].slice(0, 300)));
    } catch {}
    onOverride(marks, note.trim());
    setShowTeacher(false);
  };

  const firstLost = result.lostMarksAnalysis?.[0];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Scale size={18} /><h3 className="font-bold">Marking consistency check</h3></div>
        {crossCheck ? (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Primary marker: {result.marksAwarded}/{result.totalMarks}</Badge>
              <Badge variant="outline">Offline cross-check: {crossCheck.offline.marksAwarded}/{crossCheck.offline.totalMarks}</Badge>
            </div>
            <div className={`mt-3 flex gap-2 rounded-lg p-3 text-sm ${crossCheck.difference <= 1 ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
              {crossCheck.difference <= 1 ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <TriangleAlert size={17} className="mt-0.5 shrink-0" />}
              <div>{crossCheck.difference <= 1 ? 'The independent rule-based cross-check is within one mark of the primary result.' : `The two marking methods differ by ${crossCheck.difference} marks. A teacher review is sensible for this response.`}</div>
            </div>
          </div>
        ) : <p className="mt-3 text-sm text-gray-600">Cross-checking needs a typed answer. Image-only responses rely on AI/teacher review.</p>}

        <button type="button" onClick={() => setShowMistake(value => !value)} className="mt-4 text-sm font-semibold text-blue-700 hover:underline">Explain my main mistake</button>
        {showMistake ? <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-950">{firstLost ? <><strong>{firstLost.reason}</strong><p className="mt-1">{firstLost.improvementSuggestion}</p></> : 'No lost marking point was recorded for this response.'}</div> : null}
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><ShieldCheck size={18} /><h3 className="font-bold">Teacher mark override</h3></div><Button variant="outline" size="sm" onClick={() => setShowTeacher(value => !value)}>{showTeacher ? 'Close' : 'Review mark'}</Button></div>
        <p className="mt-2 text-sm text-gray-600">A teacher can replace the automated mark while keeping the original mark in the local audit history.</p>
        {showTeacher ? <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Final mark (0–{question.maxMarks})<input type="number" min={0} max={question.maxMarks} value={overrideMarks} onChange={event => setOverrideMarks(Number(event.target.value))} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm font-medium">Teacher note<textarea value={note} onChange={event => setNote(event.target.value)} className="mt-1 min-h-20 w-full rounded border p-2" placeholder="Optional reason for the change" /></label>
          <Button onClick={saveOverride}>Apply teacher mark</Button>
        </div> : null}
      </div>
    </div>
  );
}
