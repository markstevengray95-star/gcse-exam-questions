"use client";

import { useMemo, useState } from 'react';
import type { Question } from '@/data/questions';
import { specificationPoints } from '@/data/specification';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalculationPractice } from '@/components/CalculationPractice';
import { MockExamBuilder } from '@/components/MockExamBuilder';
import { MistakeNotebook } from '@/components/MistakeNotebook';
import { Brain, Calculator, FileText, Sparkles, WandSparkles } from 'lucide-react';

export type GeneratedQuestion = Question & { source: string };

type Props = {
  onUse?: (question: GeneratedQuestion) => void;
  onPracticeQuestion?: (questionId: string) => void;
};

export function QuestionGenerator({ onUse, onPracticeQuestion }: Props) {
  const [mode, setMode] = useState<'generator' | 'calculations' | 'mock' | 'mistakes'>('generator');
  const [topic, setTopic] = useState(specificationPoints[0].id);
  const [marks, setMarks] = useState(6);
  const [difficulty, setDifficulty] = useState('Medium');
  const [customArea, setCustomArea] = useState('');
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupedTopics = useMemo(() => {
    const groups = new Map<string, typeof specificationPoints>();
    for (const point of specificationPoints) groups.set(point.section, [...(groups.get(point.section) || []), point]);
    return [...groups.entries()];
  }, []);

  const generate = async (custom = false) => {
    setLoading(true);
    setError('');

    try {
      const endpoint = custom ? '/api/generate-custom-question' : '/api/generate-question';
      const payload = custom
        ? { area: customArea.trim(), marks, difficulty }
        : { topic, marks, difficulty };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || data?.error || !data?.question) throw new Error(data?.error || 'Question generation failed.');
      setQuestion(data.question);
    } catch (err) {
      setQuestion(null);
      setError(err instanceof Error ? err.message : 'Question generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Practice studio</div>
            <h2 className="mt-1 text-2xl font-extrabold">Choose how you want to practise</h2>
            <p className="mt-1 text-sm text-slate-300">Generate questions, drill calculations, sit a timed mock, or revisit lost marks with spaced repetition.</p>
          </div>
          <div className="flex flex-wrap rounded-xl border border-white/10 bg-white/5 p-1">
            <button type="button" onClick={() => setMode('generator')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'generator' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'}`}><WandSparkles size={16} />Generator</button>
            <button type="button" onClick={() => setMode('calculations')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'calculations' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'}`}><Calculator size={16} />Calculations</button>
            <button type="button" onClick={() => setMode('mock')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'mock' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'}`}><FileText size={16} />Mock exam</button>
            <button type="button" onClick={() => setMode('mistakes')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'mistakes' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:bg-white/10'}`}><Brain size={16} />Mistakes</button>
          </div>
        </div>
      </div>

      {mode === 'calculations' ? <CalculationPractice /> : mode === 'mock' ? <MockExamBuilder /> : mode === 'mistakes' ? <MistakeNotebook onPracticeQuestion={onPracticeQuestion} /> : (
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-700"><Sparkles size={17} /> Question generator</div>
              <p className="mt-1 text-sm text-slate-600">Create an original, fully markable GCSE Science-style question from any verified Biology, Chemistry or Physics specification area.</p>
            </div>
            <Badge className="bg-emerald-600">Full GCSE coverage</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-900">Specification-area generator</div>
              <p className="mt-1 text-xs text-slate-500">Works without an API key and uses the verified built-in specification bank.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <select value={topic} onChange={event => setTopic(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 text-sm sm:col-span-2" aria-label="Generated question topic">
                  {groupedTopics.map(([section, points]) => (
                    <optgroup key={section} label={section}>
                      {points.map(point => <option key={point.id} value={point.id}>{point.specCode} · {point.label}</option>)}
                    </optgroup>
                  ))}
                </select>
                <select value={marks} onChange={event => setMarks(Number(event.target.value))} className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm" aria-label="Generated question marks"><option value={2}>2 marks</option><option value={3}>3 marks</option><option value={4}>4 marks</option><option value={5}>5 marks</option><option value={6}>6 marks</option></select>
                <select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm" aria-label="Generated question difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>
                <Button onClick={() => void generate(false)} disabled={loading} className="rounded-xl bg-blue-700 hover:bg-blue-800 sm:col-span-2">{loading ? 'Generating…' : 'Generate specification question'}</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-sm font-bold text-purple-950">Generate from any typed area</div><div className="mt-1 text-xs text-purple-800">Try “osmosis”, “moles and reacting masses”, “electrolysis”, “half-life”, “wave speed”, or “required practical evaluation”.</div></div><Badge className="bg-purple-700">Smart custom</Badge></div>
              <div className="mt-3 flex flex-col gap-2">
                <input value={customArea} onChange={event => setCustomArea(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && customArea.trim() && !loading) void generate(true); }} placeholder="Type the exact GCSE science area or skill you want..." className="min-w-0 rounded-xl border border-purple-200 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500" maxLength={160} aria-label="Custom GCSE science area for question generation" />
                <Button onClick={() => void generate(true)} disabled={loading || customArea.trim().length < 3} className="rounded-xl bg-purple-700 hover:bg-purple-800">Generate on this area</Button>
              </div>
              <div className="mt-2 text-[11px] text-purple-700">With Gemini this creates a fresh AI variant. Without a key—or if AI generation fails—it falls back to the closest verified specification question instead of failing.</div>
            </div>
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          {question ? (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-950"><Badge className="bg-blue-700">Generated</Badge><span>{question.topic}</span><span>·</span><span>{question.maxMarks} marks</span><span>·</span><span>{question.difficulty}</span><span>·</span><span>{question.commandWord}</span></div>
              <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-950">{question.prompt}</p>
              <p className="mt-2 text-xs text-blue-800">{question.source}</p>
              {onUse ? <button onClick={() => onUse(question)} className="mt-4 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-800 shadow-sm hover:bg-blue-100">Use and mark this question</button> : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
