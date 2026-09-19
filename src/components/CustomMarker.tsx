"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/components/FeedbackDisplay';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface CustomMarkerProps {
  onFeedbackReceived: (result: AnalysisResult | null) => void;
  apiKey: string;
  provider?: 'online' | 'offline' | string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function validateImage(file: File) {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.';
  if (file.size > MAX_IMAGE_BYTES) return 'Please use an image smaller than 5 MB.';
  return '';
}

export function CustomMarker({ onFeedbackReceived, apiKey, provider = 'online' }: CustomMarkerProps) {
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [commandWord, setCommandWord] = useState('');
  const [maxMarks, setMaxMarks] = useState(6);
  const [markScheme, setMarkScheme] = useState('');
  const [markSchemeImage, setMarkSchemeImage] = useState<File | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const setImage = (file: File | undefined, setter: (file: File | null) => void) => {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setter(file);
  };

  const fileToInlineData = async (file: File): Promise<{ data: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const data = result.includes(',') ? result.split(',')[1] : '';
        if (!data) reject(new Error('Could not read the uploaded image.'));
        else resolve({ data, mimeType: file.type });
      };
      reader.onerror = () => reject(new Error('Could not read the uploaded image.'));
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async () => {
    if (!questionPrompt.trim() && !questionImage) {
      setError('Add the question as text or an image.');
      return;
    }
    if (!studentAnswer.trim() && !studentImage) {
      setError('Add the student answer as text or an image.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    onFeedbackReceived(null);

    try {
      const payload: Record<string, unknown> = {
        commandWord: commandWord.trim(),
        maxMarks: Math.max(1, Math.min(25, Math.trunc(maxMarks || 1))),
        apiKey,
        provider,
      };

      if (questionPrompt.trim()) payload.questionPrompt = questionPrompt.trim();
      if (questionImage) payload.questionInlineData = await fileToInlineData(questionImage);

      const schemePoints = markScheme.split('\n').map(line => line.trim()).filter(Boolean);
      if (schemePoints.length) payload.markScheme = schemePoints;
      if (markSchemeImage) payload.markSchemeInlineData = await fileToInlineData(markSchemeImage);

      if (studentAnswer.trim()) payload.studentAnswer = studentAnswer.trim();
      if (studentImage) payload.studentInlineData = await fileToInlineData(studentImage);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || 'The marker could not analyse this answer.');
      if (typeof data?.marksAwarded !== 'number') throw new Error('The marker returned an incomplete result.');

      onFeedbackReceived(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-extrabold text-gray-900">Custom answer marker</h2>
        <p className="text-gray-600">Type a question or upload clear images of the question, mark scheme and handwritten answer.</p>
      </div>

      <Card className="space-y-5 border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 flex justify-between gap-3 text-sm font-semibold">
            <span>Question prompt *</span>
            {questionImage ? <span className="truncate text-xs font-normal text-blue-600">{questionImage.name}</span> : null}
          </label>
          <div className="relative">
            <textarea
              className="w-full rounded-md border border-gray-300 p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={questionPrompt}
              onChange={event => setQuestionPrompt(event.target.value)}
              placeholder="Type or paste the question here..."
            />
            <label className="absolute right-2 top-2 cursor-pointer rounded bg-gray-100 p-2 transition hover:bg-gray-200" title="Upload question image">
              <ImageIcon size={18} className="text-gray-500" />
              <input type="file" className="hidden" accept="image/*" onChange={event => setImage(event.target.files?.[0], setQuestionImage)} />
            </label>
          </div>
          {questionImage ? <button className="mt-1 text-xs text-red-600 hover:underline" onClick={() => setQuestionImage(null)}>Remove question image</button> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Command word</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={commandWord}
              onChange={event => setCommandWord(event.target.value)}
              placeholder="e.g. Explain"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Max marks *</label>
            <input
              type="number"
              min={1}
              max={25}
              className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={maxMarks}
              onChange={event => setMaxMarks(Number(event.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 flex justify-between gap-3 text-sm font-semibold">
            <span>Mark scheme (recommended)</span>
            {markSchemeImage ? <span className="truncate text-xs font-normal text-blue-600">{markSchemeImage.name}</span> : null}
          </label>
          <div className="relative">
            <textarea
              className="w-full rounded-md border border-gray-300 p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={markScheme}
              onChange={event => setMarkScheme(event.target.value)}
              placeholder="Paste one marking point per line..."
            />
            <label className="absolute right-2 top-2 cursor-pointer rounded bg-gray-100 p-2 transition hover:bg-gray-200" title="Upload mark scheme image">
              <ImageIcon size={18} className="text-gray-500" />
              <input type="file" className="hidden" accept="image/*" onChange={event => setImage(event.target.files?.[0], setMarkSchemeImage)} />
            </label>
          </div>
          {markSchemeImage ? <button className="mt-1 text-xs text-red-600 hover:underline" onClick={() => setMarkSchemeImage(null)}>Remove mark-scheme image</button> : null}
        </div>
      </Card>

      <Card className="border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-4 block text-sm font-semibold">Student answer *</label>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col">
            <span className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500"><ImageIcon size={14} /> Upload a clear photo</span>
            <label className={`flex min-h-44 flex-grow cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${studentImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
              <Upload className={`mb-3 h-10 w-10 ${studentImage ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-center text-sm font-medium text-gray-700">{studentImage ? studentImage.name : 'Choose an image of the handwritten answer'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={event => setImage(event.target.files?.[0], setStudentImage)} />
            </label>
            {studentImage ? <button className="mt-2 text-left text-xs text-red-600 hover:underline" onClick={() => setStudentImage(null)}>Remove answer image</button> : null}
          </div>

          <div className="flex flex-col">
            <span className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Typed answer or optional transcription</span>
            <textarea
              className="min-h-44 w-full flex-grow rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={studentAnswer}
              onChange={event => setStudentAnswer(event.target.value)}
              placeholder="Type the answer here, or add a transcription to help with unclear handwriting..."
            />
          </div>
        </div>
      </Card>

      {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-full px-12 py-6 text-lg font-bold shadow-md md:w-auto"
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!studentAnswer.trim() && !studentImage) || (!questionPrompt.trim() && !questionImage)}
        >
          {isAnalyzing ? 'Analysing…' : 'Mark custom answer'}
        </Button>
      </div>
    </div>
  );
}
