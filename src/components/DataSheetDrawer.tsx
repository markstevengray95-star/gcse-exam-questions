"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, GripHorizontal, Info, Lightbulb, Maximize2, Minimize2, RotateCcw, Search, TriangleAlert, X } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { equationGuideCount, equationGuideSections, type FormulaGuideItem } from '@/data/equationGuide';
import 'katex/dist/katex.min.css';

type Point = { x: number; y: number };

export function DataSheetDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [position, setPosition] = useState<Point>({ x: 24, y: 88 });
  const [minimised, setMinimised] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  const selected = useMemo<FormulaGuideItem | null>(() => {
    if (!selectedId) return null;
    return equationGuideSections.flatMap(section => section.formulae).find(item => item.id === selectedId) || null;
  }, [selectedId]);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return equationGuideSections;
    return equationGuideSections
      .map(section => ({
        ...section,
        formulae: section.formulae.filter(item => `${item.title} ${item.meaning} ${item.whenToUse} ${item.variables.map(variable => `${variable.name} ${variable.meaning}`).join(' ')}`.toLowerCase().includes(query)),
      }))
      .filter(section => section.formulae.length);
  }, [search]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const width = Math.min(560, window.innerWidth - 16);
      const maxX = Math.max(8, window.innerWidth - width - 8);
      const maxY = Math.max(8, window.innerHeight - 72);
      setPosition({
        x: Math.max(8, Math.min(maxX, event.clientX - dragOffset.current.x)),
        y: Math.max(8, Math.min(maxY, event.clientY - dragOffset.current.y)),
      });
    };
    const stop = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [dragging]);

  if (!isOpen) return null;

  return (
    <aside
      className="fixed z-[70] w-[min(560px,calc(100vw-16px))] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
      style={{ left: position.x, top: position.y, maxHeight: minimised ? 58 : 'min(82vh,780px)' }}
      aria-label="Movable interactive equation sheet"
    >
      <div
        className="flex cursor-move touch-none items-center gap-2 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-3 py-3 text-white"
        onPointerDown={event => {
          const rect = event.currentTarget.parentElement?.getBoundingClientRect();
          if (!rect) return;
          dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
          setDragging(true);
        }}
      >
        <GripHorizontal size={18} className="shrink-0 text-slate-400" />
        <BookOpen size={18} className="shrink-0 text-blue-300" />
        <div className="min-w-0 flex-1">
          <div className="font-bold">Interactive A-level Physics equation sheet</div>
          <div className="text-[11px] text-slate-400">Click any formula for a plain-English breakdown · {equationGuideCount} equations</div>
        </div>
        <button type="button" className="rounded-lg p-1.5 hover:bg-white/10" title="Reset position" onPointerDown={event => event.stopPropagation()} onClick={() => setPosition({ x: 24, y: 88 })}><RotateCcw size={16} /></button>
        <button type="button" className="rounded-lg p-1.5 hover:bg-white/10" title={minimised ? 'Expand equation sheet' : 'Minimise equation sheet'} onPointerDown={event => event.stopPropagation()} onClick={() => setMinimised(value => !value)}>{minimised ? <Maximize2 size={16} /> : <Minimize2 size={16} />}</button>
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" title="Close equation sheet"><X size={18} /></button>
      </div>

      {!minimised ? (
        <div className="max-h-[calc(min(82vh,780px)-58px)] overflow-y-auto bg-slate-50 p-4">
          {selected ? (
            <div className="space-y-4">
              <button type="button" onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline"><ChevronLeft size={16} />Back to all equations</button>

              <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{selected.title}</div>
                  <div className="mt-2 overflow-x-auto text-xl"><BlockMath math={selected.latex} errorColor="#b91c1c" /></div>
                </div>
                <div className="space-y-5 p-5">
                  <div>
                    <h3 className="flex items-center gap-2 font-extrabold text-slate-950"><Info size={18} className="text-blue-600" />What does this equation mean?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{selected.meaning}</p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-950">What each part means</h3>
                    <div className="mt-2 space-y-2">
                      {selected.variables.map(variable => (
                        <div key={`${selected.id}-${variable.symbol}-${variable.name}`} className="grid grid-cols-[72px_1fr] gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex min-h-10 items-center justify-center rounded-lg bg-white px-2 text-center shadow-sm"><InlineMath math={variable.symbol} /></div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{variable.name}{variable.unit ? <span className="ml-2 font-medium text-slate-500">({variable.unit.replace(/\\Omega/g, 'Ω')})</span> : null}</div>
                            <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{variable.meaning}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">When to use it</div>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-950">{selected.whenToUse}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-800"><Lightbulb size={14} />Mini example</div>
                      <p className="mt-1 text-sm leading-relaxed text-amber-950">{selected.example}</p>
                    </div>
                  </div>

                  {selected.rearrangements?.length ? (
                    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-violet-800">Useful rearrangements</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.rearrangements.map(item => <span key={item} className="rounded-lg border border-violet-200 bg-white px-3 py-2"><InlineMath math={item} /></span>)}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
                    <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                    <div><strong>Common mistake:</strong> {selected.commonMistake}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                <strong>Learn the equations, not just the symbols.</strong> Click any formula to see what it means, what every symbol represents, when to use it, a mini example and a common exam mistake.
              </div>

              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search equations, e.g. capacitor, momentum, power..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>

              <div className="space-y-5">
                {filteredSections.map(section => (
                  <section key={section.title}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.title}</h3>
                      <span className="text-[11px] text-slate-400">{section.formulae.length} equation{section.formulae.length === 1 ? '' : 's'}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {section.formulae.map(formula => (
                        <button key={formula.id} type="button" onClick={() => setSelectedId(formula.id)} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                          <div className="overflow-x-auto"><BlockMath math={formula.latex} errorColor="#b91c1c" /></div>
                          <div className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-slate-500 group-hover:text-blue-700"><Info size={13} />{formula.title}</div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                {!filteredSections.length ? <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">No equations match “{search}”.</div> : null}
              </div>
            </>
          )}
        </div>
      ) : null}
    </aside>
  );
}
