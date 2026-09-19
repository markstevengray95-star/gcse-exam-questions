import React from 'react';
import { Card } from '@/components/ui/card';

interface RealTimeAnalysisProps {
  answer: string;
}

export function RealTimeAnalysis({ answer }: RealTimeAnalysisProps) {
  const text = answer.toLowerCase();

  // Basic regex matching for structural analysis (simplified heuristics)
  const descriptiveWords = ['is', 'are', 'was', 'were', 'has', 'have', 'consists', 'made of', 'shows'];
  const explanationWords = ['because', 'therefore', 'so', 'due to', 'meaning', 'causes', 'results in', 'since', 'as a result'];
  const comparisonWords = ['however', 'whereas', 'but', 'although', 'compared to', 'while', 'on the other hand', 'both', 'similarly', 'differs'];
  const evaluationWords = ['effective', 'ineffective', 'valid', 'invalid', 'advantage', 'disadvantage', 'strength', 'weakness', 'best', 'worst', 'flawed'];
  const justificationWords = ['evidence', 'proves', 'shows that', 'supports', 'demonstrates', 'verified by'];

  const countMatches = (words: string[]) => {
    return words.reduce((acc, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
  };

  const scores = {
    descriptive: countMatches(descriptiveWords),
    explanation: countMatches(explanationWords),
    comparison: countMatches(comparisonWords),
    evaluation: countMatches(evaluationWords),
    justification: countMatches(justificationWords),
    suggestion: countMatches(['could', 'might', 'may', 'perhaps', 'possible', 'hypothesis'])
  };

  const maxScore = Math.max(1, Object.values(scores).reduce((a,b) => a+b, 0)); // Prevent div by 0

  const getPercentage = (score: number) => {
    if (text.length === 0) return 0;
    // Boost percentages slightly for visual feedback, capped at 100
    return Math.min(100, Math.round((score / maxScore) * 100 * 1.5));
  };

  const metrics = [
    { label: 'Descriptive Fact Recall', score: scores.descriptive, color: 'bg-blue-500' },
    { label: 'Explanations (Causes/Reasons)', score: scores.explanation, color: 'bg-green-500' },
    { label: 'Comparisons (Similarities/Differences)', score: scores.comparison, color: 'bg-purple-500' },
    { label: 'Evaluations (Judgments)', score: scores.evaluation, color: 'bg-red-500' },
    { label: 'Justifications (Evidence)', score: scores.justification, color: 'bg-yellow-500' },
    { label: 'Suggestions (Hypotheses)', score: scores.suggestion, color: 'bg-orange-500' },
  ];

  return (
    <Card className="p-5 bg-white shadow-sm border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
        Real-time Analysis
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Heuristic Based</span>
      </h3>

      <div className="space-y-4">
        {metrics.map((metric, i) => {
          const pct = getPercentage(metric.score);
          return (
            <div key={i}>
              <div className="flex justify-between text-xs font-semibold mb-1 text-gray-700">
                <span>{metric.label}</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
