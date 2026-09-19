"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getIndicativeGrade, getMarksNeededForNextBand, PRACTICE_GRADE_NOTICE } from '@/lib/grading';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export interface AnalysisResult {
  marksAwarded: number;
  totalMarks: number;
  commandWordCheck: { commandWord: string; satisfied: boolean; examinerNotes: string };
  keywordAnalysis: { presentKeywords: string[]; missingKeywords: string[]; laymanTermsUsed?: string[] };
  creditedPoints: { mark: string; studentEvidence: string }[];
  lostMarksAnalysis: { reason: string; improvementSuggestion: string }[];
  lorRubric?: { levelAwarded: number; levelDescription: string; justification: string };
  sigFigUnitAudit?: { issue: string; suggestion: string }[];
  misconceptions?: string[];
  inDepthAnalysis: { physicsPrinciples: string; stepByStepReasoning: string; structureAndClarity: string };
  officialMarkScheme: string[];
  modelAnswer: string;
  examinerConfidence?: number;
  confidenceReason?: string;
  reviewRecommended?: boolean;
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

interface Props {
  result: AnalysisResult;
  onRewrite?: () => void;
}

function gradeColour(percent: number) {
  if (percent >= 70) return 'text-green-700';
  if (percent >= 50) return 'text-amber-700';
  return 'text-red-700';
}

export function FeedbackDisplay({ result, onRewrite }: Props) {
  const totalMarks = Math.max(0, Number(result.totalMarks) || 0);
  const marksAwarded = Math.max(0, Math.min(totalMarks, Number(result.marksAwarded) || 0));
  const percentage = totalMarks ? Math.round((marksAwarded / totalMarks) * 100) : 0;
  const grade = getIndicativeGrade(percentage);
  const nextBand = getMarksNeededForNextBand(marksAwarded, totalMarks);
  const gradeClass = gradeColour(percentage);
  const confidence = result.examinerConfidence ?? (result.fallbackUsed ? 50 : undefined);

  const render = (text = '') =>
    text.split(/(\$.*?\$)/g).map((part, index) =>
      part.startsWith('$') && part.endsWith('$') ? (
        <InlineMath key={index} math={part.slice(1, -1)} />
      ) : (
        <span key={index}>{part}</span>
      ),
    );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Exam result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-gray-500">Mark</div>
              <div className={`text-5xl font-extrabold ${gradeClass}`}>
                {marksAwarded}
                <span className="text-2xl text-gray-400"> / {totalMarks}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Percentage</div>
              <div className="text-3xl font-bold">{percentage}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Indicative practice band</div>
              <div className={`text-4xl font-extrabold ${gradeClass}`}>{grade.grade}</div>
              {nextBand?.nextGrade && nextBand.marksNeeded > 0 ? (
                <div className="text-xs text-gray-600">
                  {nextBand.marksNeeded} more mark{nextBand.marksNeeded === 1 ? '' : 's'} on a question of this size would reach the {nextBand.nextGrade} practice band.
                </div>
              ) : (
                <div className="text-xs text-gray-600">Top practice band reached for this answer.</div>
              )}
            </div>
          </div>
          <div className="mt-4 rounded border bg-gray-50 p-3 text-sm text-gray-700">{PRACTICE_GRADE_NOTICE}</div>

          {typeof confidence === 'number' && (
            <div
              className={`mt-4 rounded border p-4 ${
                confidence >= 80
                  ? 'border-green-200 bg-green-50'
                  : confidence >= 70
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <strong>Examiner confidence: {Math.max(0, Math.min(100, Math.round(confidence)))}%</strong>
                <strong>{confidence >= 80 ? 'High' : confidence >= 70 ? 'Medium' : 'Low'}</strong>
              </div>
              <p className="mt-1 text-sm">
                {result.confidenceReason || 'Based on the completeness and clarity of the evidence available to the marker.'}
              </p>
              {result.reviewRecommended && (
                <p className="mt-2 text-sm font-semibold">Review recommended because the mark is less certain.</p>
              )}
              {result.fallbackUsed && (
                <p className="mt-2 text-sm">Offline marker used: {result.fallbackReason || 'AI service unavailable.'}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {result.commandWordCheck && (
        <Card>
          <CardHeader>
            <CardTitle>Command word</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={result.commandWordCheck.satisfied ? 'bg-green-600' : 'bg-amber-600'}>
              {result.commandWordCheck.commandWord || 'Response'}: {result.commandWordCheck.satisfied ? 'Satisfied' : 'Not fully satisfied'}
            </Badge>
            <p className="mt-2 text-sm">{result.commandWordCheck.examinerNotes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Marks awarded</CardTitle>
          </CardHeader>
          <CardContent>
            {result.creditedPoints?.length ? (
              <ul className="space-y-3 text-sm">
                {result.creditedPoints.map((point, index) => (
                  <li key={`${point.mark}-${index}`}>
                    <strong>{point.mark || 'Credit'}</strong>
                    {point.studentEvidence ? <span> — “{point.studentEvidence}”</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">No creditable marking points were identified.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Marks lost and how to improve</CardTitle>
          </CardHeader>
          <CardContent>
            {result.lostMarksAnalysis?.length ? (
              <ul className="space-y-3 text-sm">
                {result.lostMarksAnalysis.map((point, index) => (
                  <li key={`${point.reason}-${index}`}>
                    <strong>{point.reason}</strong>
                    <br />
                    <span className="text-amber-800">{point.improvementSuggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Full marks — no additional marking points are needed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {result.lorRubric && (
        <Card>
          <CardHeader>
            <CardTitle>Level of response</CardTitle>
          </CardHeader>
          <CardContent>
            <strong>Level {result.lorRubric.levelAwarded}/3</strong>
            <p className="mt-2 text-sm">{result.lorRubric.levelDescription}</p>
            <p className="mt-2 text-sm">{result.lorRubric.justification}</p>
          </CardContent>
        </Card>
      )}

      {result.inDepthAnalysis && (
        <Card className="bg-indigo-50">
          <CardHeader>
            <CardTitle>Examiner analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Physics principles:</strong> {render(result.inDepthAnalysis.physicsPrinciples)}</div>
            <div><strong>Working/reasoning:</strong> {render(result.inDepthAnalysis.stepByStepReasoning)}</div>
            <div><strong>Structure:</strong> {render(result.inDepthAnalysis.structureAndClarity)}</div>
          </CardContent>
        </Card>
      )}

      {result.misconceptions?.length ? (
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle>Misconceptions to fix</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              {result.misconceptions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {result.sigFigUnitAudit?.length ? (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle>Units and significant figures</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              {result.sigFigUnitAudit.map((item, index) => (
                <li key={`${item.issue}-${index}`}><strong>{item.issue}</strong> — {item.suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Mark scheme and model answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {result.officialMarkScheme?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {result.officialMarkScheme.map((item, index) => <li key={`${item}-${index}`}>{render(item)}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500">No mark scheme points were returned.</p>
          )}
          {result.modelAnswer ? (
            <div className="whitespace-pre-wrap rounded border bg-blue-50 p-4">{render(result.modelAnswer)}</div>
          ) : null}
        </CardContent>
      </Card>

      {onRewrite && (
        <div className="text-center">
          <button onClick={onRewrite} className="rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">
            Rewrite this answer
          </button>
        </div>
      )}
    </div>
  );
}
