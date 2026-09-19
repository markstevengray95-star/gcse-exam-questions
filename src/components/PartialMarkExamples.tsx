"use client";

import type { Question } from '@/data/questions';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function clean(point: string) {
  return point.replace(/^\[[^\]]+\]\s*/, '').trim();
}

function joinPoints(points: string[]) {
  return points.map(clean).filter(Boolean).join(' ');
}

function exampleFor(question: Question, targetMarks: number) {
  const scheme = question.markScheme.map(clean).filter(Boolean);
  const count = Math.max(1, Math.min(scheme.length, targetMarks));
  return joinPoints(scheme.slice(0, count));
}

function missingFor(question: Question, targetMarks: number) {
  const scheme = question.markScheme.map(clean).filter(Boolean);
  return scheme.slice(Math.max(1, targetMarks), Math.min(scheme.length, targetMarks + 2));
}

export function PartialMarkExamples({ question, result }: { question: Question; result: AnalysisResult }) {
  const total = Math.max(1, question.maxMarks);
  const current = Math.max(0, Math.min(total, result.marksAwarded));

  const bands = total === 6
    ? [
        { label: 'Level 1', range: '1–2 marks', target: 2, note: 'Some relevant scientific points are present, but the response is incomplete, weakly linked or not sufficiently sequenced.' },
        { label: 'Level 2', range: '3–4 marks', target: 4, note: 'Most of the important science is present and there are some logical links, but detail, sequencing, comparison or evaluation is still incomplete.' },
        { label: 'Level 3', range: '5–6 marks', target: 6, note: 'A detailed, logically linked response addresses the command word and gives a valid method, explanation, comparison or judgement.' },
      ]
    : Array.from(new Set([
        Math.max(1, Math.floor(total / 3)),
        Math.max(1, Math.ceil((total * 2) / 3)),
        Math.max(1, total - 1),
      ])).filter(mark => mark < total).map(mark => ({
        label: `${mark}-mark example`,
        range: `${mark}/${total}`,
        target: mark,
        note: `This response shows roughly ${mark} creditworthy marking point${mark === 1 ? '' : 's'} but still misses material needed for full marks.`,
      }));

  return (
    <Card className="border-violet-200 bg-violet-50">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Partial-mark answer ladder</CardTitle>
          <Badge variant="outline">Your mark: {current}/{total}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-violet-950">
          These are illustrative responses generated from this question&apos;s mark scheme. They show how an answer can gain some marks without reaching full credit.
        </p>

        {question.sourcePartialMark ? (
          <div className="rounded-lg border border-violet-300 bg-white p-3 text-sm">
            <strong>Question-bank partial-answer profile:</strong>{' '}
            the source question included a worked partial response at about {question.sourcePartialMark.awarded}/{question.sourcePartialMark.total}.
            The example below at the nearest band is rewritten for this app rather than copied from the source.
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-3">
          {bands.map(band => {
            const answer = exampleFor(question, band.target);
            const missing = missingFor(question, band.target);
            const nearCurrent = Math.abs(current - band.target) <= 1;
            return (
              <div key={band.range} className={`rounded-xl border bg-white p-4 ${nearCurrent ? 'border-violet-400 ring-1 ring-violet-300' : 'border-violet-100'}`}>
                <div className="flex items-center justify-between gap-2">
                  <strong>{band.label}</strong>
                  <Badge className={band.target >= total - 1 ? 'bg-emerald-700' : band.target >= total / 2 ? 'bg-amber-600' : 'bg-slate-600'}>{band.range}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6">{answer || 'A short response containing only a limited number of relevant scientific points.'}</p>
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{band.note}</div>
                {missing.length ? (
                  <div className="mt-3 text-xs text-rose-800">
                    <strong>To move up:</strong> {missing.join(' ')}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {total === 6 ? (
          <div className="rounded-lg border bg-white p-3 text-xs text-gray-600">
            For 6-mark level-of-response questions the exact mark within a level depends on the overall quality, logical links, use of evidence and how fully the command word is answered; it is not simply one mark per sentence.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
