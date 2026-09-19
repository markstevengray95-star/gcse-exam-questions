"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface SymbolBarProps {
  onInsert: (symbol: string) => void;
}

const symbols = [
  { label: 'lambda', tex: '\\lambda', insert: 'λ' },
  { label: 'epsilon0', tex: '\\varepsilon_0', insert: 'ε₀' },
  { label: 'phi', tex: '\\Phi', insert: 'Φ' },
  { label: 'delta', tex: '\\Delta', insert: 'Δ' },
  { label: 'theta', tex: '\\theta', insert: 'θ' },
  { label: 'omega', tex: '\\omega', insert: 'ω' },
  { label: 'rho', tex: '\\rho', insert: 'ρ' },
  { label: 'mu', tex: '\\mu', insert: 'μ' },
  { label: 'alpha', tex: '\\alpha', insert: 'α' },
  { label: 'beta', tex: '\\beta', insert: 'β' },
  { label: 'gamma', tex: '\\gamma', insert: 'γ' },
  { label: 'times', tex: '\\times', insert: '×' },
  { label: 'approximately', tex: '\\approx', insert: '≈' },
  { label: 'proportional', tex: '\\propto', insert: '∝' },
  { label: 'plusminus', tex: '\\pm', insert: '±' },
  { label: 'squared', tex: 'x^2', insert: '²' },
  { label: 'cubed', tex: 'x^3', insert: '³' },
  { label: 'inverse', tex: 'x^{-1}', insert: '⁻¹' },
  { label: 'degree', tex: '^\\circ', insert: '°' },
];

export function SymbolBar({ onInsert }: SymbolBarProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-t-md border border-b-0 border-gray-200 bg-gray-50 p-2">
      {symbols.map(sym => (
        <Button
          key={sym.label}
          variant="outline"
          size="sm"
          className="h-8 bg-white px-2 py-1 text-sm hover:bg-gray-100"
          onClick={() => onInsert(sym.insert)}
          title={`Insert ${sym.label}`}
          type="button"
        >
          <InlineMath math={sym.tex} />
        </Button>
      ))}
      {['×10⁻³', '×10⁻⁶', '×10⁻⁹'].map(value => (
        <Button key={value} variant="outline" size="sm" className="h-8 bg-white px-2 py-1 text-sm" type="button" onClick={() => onInsert(value)}>{value}</Button>
      ))}
    </div>
  );
}
