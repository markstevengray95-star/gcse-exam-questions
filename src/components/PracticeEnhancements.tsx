"use client";

import { useState } from 'react';
import type { Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiagramAnswerPad } from '@/components/DiagramAnswerPad';

export type StudentConfidence = 1 | 2 | 3 | 4 | 5;

export type AnswerImage = {
  inlineData: { data: string; mimeType: string };
  previewUrl: string;
  name: string;
};

export type AttemptRecord = {
  id: string;
  questionId: string;
  createdAt: string;
  marks: number;
  total: number;
  studentConfidence: StudentConfidence;
  examinerConfidence?: number;
  answerPreview: string;
  answerMode: 'typed' | 'image' | 'mixed';
  misconceptions: string[];
  lostMarks: number;
};

export type AttemptHistory = Record<string, AttemptRecord[]>;
export type FollowUpQuestion = Question & { source: string; focus?: string };

const confidenceLabels: Record<StudentConfidence, string> = {
  1: 'Guessing',
  2: 'Unsure',
  3: 'Fairly sure',
  4: 'Confident',
  5: 'Very confident',
};

export function ConfidenceSelector({ value, onChange, disabled = false }: {
  value: StudentConfidence;
  onChange: (value: StudentConfidence) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">How confident are you?</div>
          <div className="text-xs text-gray-500">Rate yourself before marking so the app can track confidence accuracy.</div>
        </div>
        <Badge variant="outline">{value}/5 · {confidenceLabels[value]}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {([1, 2, 3, 4, 5] as StudentConfidence[]).map(level => (
          <button
            key={level}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level)}
            className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${value === level ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white text-gray-700 hover:border-blue-300'} disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={`${level} out of 5 confidence: ${confidenceLabels[level]}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ImageAnswerUpload({ image, onImage, disabled = false }: {
  image: AnswerImage | null;
  onImage: (image: AnswerImage | null) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState('');

  const handleFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = String(reader.result || '');
      const data = previewUrl.split(',')[1];
      if (!data) {
        setError('Could not read this image.');
        return;
      }
      onImage({ inlineData: { data, mimeType: file.type }, previewUrl, name: file.name });
    };
    reader.onerror = () => setError('Could not read this image.');
    reader.readAsDataURL(file);
  };

  const drawingAttached = image?.name === 'graph-or-diagram.png';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Handwritten answer</div>
            <div className="text-xs text-gray-500">Upload a clear photo of your working. AI marking is required for image answers.</div>
          </div>
          <label className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-semibold ${disabled ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}>
            {image && !drawingAttached ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={disabled} onChange={event => handleFile(event.target.files?.[0])} />
          </label>
        </div>

        {error ? <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}

        {image && !drawingAttached ? (
          <div className="mt-4 rounded border bg-gray-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium">{image.name}</span><Button type="button" variant="outline" size="sm" onClick={() => onImage(null)}>Remove</Button></div>
            <img src={image.previewUrl} alt="Uploaded handwritten answer preview" className="mt-3 max-h-72 w-full rounded border bg-white object-contain" />
          </div>
        ) : null}
      </div>

      <DiagramAnswerPad image={image} onImage={onImage} disabled={disabled} />
    </div>
  );
}

export function ConfidenceCalibration({ studentConfidence, result }: {
  studentConfidence: StudentConfidence;
  result: AnalysisResult;
}) {
  const percent = result.totalMarks ? Math.round((result.marksAwarded / result.totalMarks) * 100) : 0;
  let title = 'Confidence looks reasonably calibrated';
  let detail = `You rated this ${studentConfidence}/5 and scored ${percent}%.`;
  let tone = 'border-blue-200 bg-blue-50 text-blue-950';

  if (studentConfidence >= 4 && percent < 60) {
    title = 'Overconfidence signal';
    detail = `You felt confident (${studentConfidence}/5) but scored ${percent}%. Review the misconception before moving on.`;
    tone = 'border-amber-200 bg-amber-50 text-amber-950';
  } else if (studentConfidence <= 2 && percent >= 80) {
    title = 'You may be underestimating yourself';
    detail = `You rated confidence ${studentConfidence}/5 but scored ${percent}%. Your knowledge was stronger than you expected.`;
    tone = 'border-green-200 bg-green-50 text-green-950';
  } else if (studentConfidence >= 4 && percent >= 80) {
    title = 'High confidence and high accuracy';
    detail = `Your ${studentConfidence}/5 confidence matched a ${percent}% score.`;
    tone = 'border-green-200 bg-green-50 text-green-950';
  }

  return <Card className={`p-4 ${tone}`}><div className="font-bold">{title}</div><p className="mt-1 text-sm">{detail}</p></Card>;
}

export function AttemptHistoryPanel({ attempts }: { attempts: AttemptRecord[] }) {
  if (!attempts.length) return null;
  const latest = attempts[attempts.length - 1];
  const previous = attempts.length > 1 ? attempts[attempts.length - 2] : null;
  const latestPercent = latest.total ? Math.round((latest.marks / latest.total) * 100) : 0;
  const previousPercent = previous?.total ? Math.round((previous.marks / previous.total) * 100) : null;
  const delta = previous ? latest.marks - previous.marks : 0;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Attempt history</h3><p className="text-xs text-gray-500">Your recent answers to this exact question.</p></div><Badge variant="outline">{attempts.length} attempt{attempts.length === 1 ? '' : 's'}</Badge></div>
      {previous ? (
        <div className="mt-4 grid gap-3 rounded-lg border bg-slate-50 p-3 sm:grid-cols-3">
          <div><div className="text-xs text-gray-500">Previous</div><div className="text-xl font-bold">{previous.marks}/{previous.total}</div></div>
          <div><div className="text-xs text-gray-500">Latest</div><div className="text-xl font-bold">{latest.marks}/{latest.total}</div></div>
          <div><div className="text-xs text-gray-500">Change</div><div className={`text-xl font-bold ${delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-700' : 'text-gray-700'}`}>{delta > 0 ? '+' : ''}{delta} mark{Math.abs(delta) === 1 ? '' : 's'}</div></div>
          <div className="sm:col-span-3 text-sm text-gray-700">Percentage: {previousPercent}% → {latestPercent}% · Confidence: {previous.studentConfidence}/5 → {latest.studentConfidence}/5</div>
        </div>
      ) : <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-sm">First recorded attempt: {latest.marks}/{latest.total} ({latestPercent}%). Rewrite this answer later to unlock a direct comparison.</div>}
      <div className="mt-4 space-y-2">
        {[...attempts].reverse().slice(0, 5).map((attempt, index) => (
          <details key={attempt.id} className="rounded border bg-white p-3" open={index === 0 && attempts.length === 1}>
            <summary className="cursor-pointer text-sm font-semibold">{new Date(attempt.createdAt).toLocaleString()} · {attempt.marks}/{attempt.total} · confidence {attempt.studentConfidence}/5 · {attempt.answerMode}</summary>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{attempt.answerPreview}</p>
            <div className="mt-2 text-xs text-gray-500">Lost marks: {attempt.lostMarks} · Misconceptions flagged: {attempt.misconceptions.length}{typeof attempt.examinerConfidence === 'number' ? ` · Examiner confidence: ${Math.round(attempt.examinerConfidence)}%` : ''}</div>
          </details>
        ))}
      </div>
    </Card>
  );
}

export function FollowUpCard({ question, loading, error, onPractice, onRetry }: {
  question: FollowUpQuestion | null;
  loading: boolean;
  error: string;
  onPractice: (question: FollowUpQuestion) => void;
  onRetry: () => void;
}) {
  if (loading) return <Card className="p-4"><div className="font-bold">Building your targeted follow-up…</div><p className="mt-1 text-sm text-gray-600">Using the marks you lost and misconceptions from this attempt.</p></Card>;
  if (!question && !error) return null;
  if (!question) return <Card className="p-4"><div className="font-bold">Targeted follow-up unavailable</div><p className="mt-1 text-sm text-gray-600">{error || 'The follow-up generator could not create a question.'}</p><Button className="mt-3" variant="outline" size="sm" onClick={onRetry}>Try again</Button></Card>;

  return (
    <Card className="border-purple-200 bg-purple-50 p-4">
      <div className="flex flex-wrap items-center gap-2"><Badge className="bg-purple-600">Smart follow-up</Badge><Badge variant="outline">{question.maxMarks} marks</Badge><Badge variant="outline">{question.difficulty}</Badge></div>
      <h3 className="mt-3 font-bold">Target the mistake while it is fresh</h3>
      {question.focus ? <p className="mt-1 text-xs font-medium text-purple-800">Focus: {question.focus}</p> : null}
      <p className="mt-2 text-sm leading-relaxed text-gray-900">{question.prompt}</p>
      <p className="mt-2 text-xs text-purple-800">{question.source}</p>
      <Button className="mt-4" onClick={() => onPractice(question)}>Practice this follow-up</Button>
    </Card>
  );
}
