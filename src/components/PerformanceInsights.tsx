import React from 'react';
import { getIndicativeGrade, PRACTICE_GRADE_NOTICE } from '@/lib/grading';

type TopicScore = { topic: string; percent: number; attempted: number };

type Props = {
  averagePercent: number;
  topicScores: TopicScore[];
  attempted: number;
  earnedMarks: number;
  availableMarks: number;
};

export function PerformanceInsights({ averagePercent, topicScores, attempted, earnedMarks, availableMarks }: Props) {
  const prediction = getIndicativeGrade(averagePercent);
  const weakest = topicScores.length ? [...topicScores].sort((a, b) => a.percent - b.percent)[0] : null;
  const strongest = topicScores.length ? [...topicScores].sort((a, b) => b.percent - a.percent)[0] : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500">Overall practice band</div>
            <div className="mt-1 flex items-end gap-3">
              <span className="text-4xl font-bold text-blue-700">{attempted ? prediction.grade : '—'}</span>
              <span className="mb-1 text-sm text-gray-600">
                {attempted ? `${prediction.percent}% across ${earnedMarks}/${availableMarks} recorded marks` : 'Mark a bank question to start your prediction'}
              </span>
            </div>
          </div>
          {attempted > 0 && prediction.nextGrade ? (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <strong>Next band:</strong> {prediction.nextGrade} at {prediction.nextMinPercent}%
              <div className="text-xs">{prediction.percentagePointsToNext} percentage point{prediction.percentagePointsToNext === 1 ? '' : 's'} away</div>
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-gray-500">{PRACTICE_GRADE_NOTICE}</p>
        {attempted > 0 && attempted < 5 ? (
          <p className="mt-2 text-xs font-medium text-amber-700">Prediction confidence is limited until you have marks from several different questions and topics.</p>
        ) : null}
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold">Topic heatmap</div>
          {weakest && strongest ? (
            <div className="text-xs text-gray-500">Strongest: {strongest.topic} · Priority: {weakest.topic}</div>
          ) : null}
        </div>
        {topicScores.length === 0 ? (
          <p className="text-sm text-gray-500">Mark some practice answers to build your heatmap.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {topicScores.map(topic => {
              const level = topic.percent >= 75
                ? 'border-green-300 bg-green-100'
                : topic.percent >= 55
                  ? 'border-amber-300 bg-amber-100'
                  : 'border-red-300 bg-red-100';

              return (
                <div key={topic.topic} className={`rounded border p-3 ${level}`}>
                  <div className="text-sm font-semibold">{topic.topic}</div>
                  <div className="text-2xl font-bold">{topic.percent}%</div>
                  <div className="text-xs text-gray-600">{topic.attempted} marked question{topic.attempted === 1 ? '' : 's'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
