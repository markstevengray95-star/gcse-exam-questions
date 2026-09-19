import React from 'react';

type PracticeStatsProps = {
  totalQuestions: number;
  attempted: number;
  earnedMarks: number;
  availableMarks: number;
  averagePercent: number;
  topicFilter: string;
};

export function PracticeStats({ totalQuestions, attempted, earnedMarks, availableMarks, averagePercent, topicFilter }: PracticeStatsProps) {
  const progress = totalQuestions ? Math.round((attempted / totalQuestions) * 100) : 0;
  const label = topicFilter === 'all' ? 'All practice' : topicFilter;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">Progress</div>
        <div className="text-xl font-bold text-gray-900">{attempted}/{totalQuestions}</div>
        <div className="text-xs text-gray-500 mt-1">{progress}% completed</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">Average</div>
        <div className="text-xl font-bold text-blue-700">{averagePercent}%</div>
        <div className="text-xs text-gray-500 mt-1">AI-marked answers</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">Marks</div>
        <div className="text-xl font-bold text-gray-900">{earnedMarks}/{availableMarks}</div>
        <div className="text-xs text-gray-500 mt-1">Across attempts</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">Filter</div>
        <div className="text-sm font-bold text-gray-900 truncate mt-1" title={label}>{label}</div>
        <div className="text-xs text-gray-500 mt-1">Current practice set</div>
      </div>
    </div>
  );
}
