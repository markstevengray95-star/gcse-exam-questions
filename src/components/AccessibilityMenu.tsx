"use client";

import { useEffect, useState } from 'react';
import { Accessibility, Minus, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type Prefs = {
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
};

const KEY = 'aqaGcseScienceAccessibility';
const DEFAULTS: Prefs = { fontScale: 1, highContrast: false, reduceMotion: false, readableFont: false };

function applyPrefs(prefs: Prefs) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--gcse-font-scale', String(prefs.fontScale));
  document.documentElement.dataset.gcseContrast = prefs.highContrast ? 'high' : 'normal';
  document.documentElement.dataset.gcseMotion = prefs.reduceMotion ? 'reduced' : 'normal';
  document.documentElement.dataset.gcseReadable = prefs.readableFont ? 'on' : 'off';
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<Prefs> | null;
      const next = saved ? { ...DEFAULTS, ...saved } : DEFAULTS;
      setPrefs(next);
      applyPrefs(next);
    } catch {
      applyPrefs(DEFAULTS);
    }
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const reset = () => update(DEFAULTS);

  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.querySelector('main');
    const text = main?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 12000) || '';
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex items-center gap-1 rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
        aria-expanded={open}
        aria-label="Accessibility options"
      >
        <Accessibility size={16} /> Accessibility
      </button>
      {open ? (
        <div className="absolute right-0 z-[70] mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-bold">Accessibility</div>
              <div className="text-xs text-gray-500">Saved on this device</div>
            </div>
            <button type="button" onClick={reset} className="rounded p-2 hover:bg-gray-100" title="Reset">
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
              <span>Text size</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => update({ fontScale: Math.max(0.9, Number((prefs.fontScale - 0.1).toFixed(1))) })} className="rounded border bg-white p-1"><Minus size={14} /></button>
                <span className="w-10 text-center font-semibold">{Math.round(prefs.fontScale * 100)}%</span>
                <button type="button" onClick={() => update({ fontScale: Math.min(1.3, Number((prefs.fontScale + 0.1).toFixed(1))) })} className="rounded border bg-white p-1"><Plus size={14} /></button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-2">
              <span>High contrast</span>
              <input type="checkbox" checked={prefs.highContrast} onChange={event => update({ highContrast: event.target.checked })} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-2">
              <span>Reduce motion</span>
              <input type="checkbox" checked={prefs.reduceMotion} onChange={event => update({ reduceMotion: event.target.checked })} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-2">
              <span>Readable font</span>
              <input type="checkbox" checked={prefs.readableFont} onChange={event => update({ readableFont: event.target.checked })} />
            </label>
            <button type="button" onClick={toggleReadAloud} className="flex w-full items-center justify-between rounded-lg bg-blue-50 p-2 font-medium text-blue-900 hover:bg-blue-100">
              <span>Read page aloud</span>{speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
