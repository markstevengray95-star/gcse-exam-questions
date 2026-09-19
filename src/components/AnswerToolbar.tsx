"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, FileText, Lightbulb, Save, Trash2 } from 'lucide-react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface AnswerToolbarProps {
  answer: string;
  setAnswer: (val: string) => void;
  hint: string;
  template: string;
}

const symbols = [
  { name: 'lambda', tex: '\\lambda', value: 'λ' },
  { name: 'delta', tex: '\\Delta', value: 'Δ' },
  { name: 'theta', tex: '\\theta', value: 'θ' },
  { name: 'epsilon', tex: '\\varepsilon', value: 'ε' },
  { name: 'epsilon zero', tex: '\\varepsilon_0', value: 'ε₀' },
  { name: 'phi', tex: '\\Phi', value: 'Φ' },
  { name: 'omega', tex: '\\omega', value: 'ω' },
  { name: 'rho', tex: '\\rho', value: 'ρ' },
  { name: 'mu', tex: '\\mu', value: 'μ' },
  { name: 'pi', tex: '\\pi', value: 'π' },
  { name: 'approximately', tex: '\\approx', value: '≈' },
  { name: 'proportional to', tex: '\\propto', value: '∝' },
  { name: 'plus or minus', tex: '\\pm', value: '±' },
  { name: 'times', tex: '\\times', value: '×' },
  { name: 'degree', tex: '^\\circ', value: '°' },
  { name: 'squared', tex: 'x^2', value: '²' },
  { name: 'cubed', tex: 'x^3', value: '³' },
  { name: 'inverse', tex: 'x^{-1}', value: '⁻¹' },
  { name: 'minus two exponent', tex: '10^{-2}', value: '⁻²' },
  { name: 'minus three exponent', tex: '10^{-3}', value: '⁻³' },
  { name: 'minus six exponent', tex: '10^{-6}', value: '⁻⁶' },
  { name: 'minus nine exponent', tex: '10^{-9}', value: '⁻⁹' },
];

export function AnswerToolbar({ answer, setAnswer, hint, template }: AnswerToolbarProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const append = (value: string) => setAnswer(`${answer}${value}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
    } catch {
      // Clipboard permission can be unavailable; the answer remains unchanged.
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your answer?')) setAnswer('');
  };

  const handleInsertTemplate = () => {
    if (!template) return;
    if (answer.trim() && !window.confirm('Append the answer template to your current response?')) return;
    setAnswer(answer + (answer ? '\n\n' : '') + template);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" type="button" onClick={() => setShowSymbols(value => !value)}>
          <span className="text-base">λ</span> {showSymbols ? 'Hide symbols' : 'Physics symbols'}
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" type="button" onClick={() => {
          try { localStorage.setItem('aqaPhysicsDraftAnswer', answer); } catch { /* optional */ }
        }}>
          <Save size={14} /> Save
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" type="button" onClick={handleCopy}>
          <Copy size={14} /> Copy
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-red-600 hover:text-red-700" type="button" onClick={handleClear}>
          <Trash2 size={14} /> Clear
        </Button>
        <div className="ml-auto text-xs font-semibold text-gray-500">{wordCount} words</div>
      </div>

      {showSymbols ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Correctly formatted physics symbols</div>
          <div className="flex flex-wrap gap-1.5">
            {symbols.map(symbol => (
              <button
                key={symbol.name}
                type="button"
                title={`Insert ${symbol.name}`}
                onClick={() => append(symbol.value)}
                className="min-w-9 rounded border border-slate-200 bg-white px-2 py-1 text-sm hover:border-blue-300 hover:bg-blue-50"
              >
                <InlineMath math={symbol.tex} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {['×10⁻³', '×10⁻⁶', '×10⁻⁹', 'm s⁻¹', 'm s⁻²', 'kg m⁻³', 'J kg⁻¹ K⁻¹', 'N C⁻¹', 'V m⁻¹'].map(value => (
              <button key={value} type="button" onClick={() => append(value)} className="rounded border bg-white px-2 py-1 hover:bg-blue-50">{value}</button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded border border-blue-100 bg-blue-50 p-2">
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-blue-700 hover:bg-blue-100" type="button" onClick={() => setShowHint(value => !value)}>
          <Lightbulb size={14} /> {showHint ? 'Hide hint' : 'Show hint'}
        </Button>
        {showHint ? <span className="flex-grow text-xs italic text-blue-800">{hint}</span> : null}
        {template ? (
          <Button variant="secondary" size="sm" className="ml-auto h-7 gap-1 border bg-white text-xs text-gray-800 hover:bg-gray-100" type="button" onClick={handleInsertTemplate}>
            <FileText size={14} /> Insert template
          </Button>
        ) : null}
      </div>
    </div>
  );
}
