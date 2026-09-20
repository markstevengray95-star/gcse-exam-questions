"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gcseScienceGeminiKey';
const COOKIE_KEY = 'gcseScienceGeminiKey';

type AiStatus = {
  connected: boolean;
  provider: 'gemini' | 'offline';
  source: string | null;
};

function syncCookie(key: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(key)}; Path=/api; SameSite=Strict; Max-Age=31536000${secure}`;
}

function clearCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_KEY}=; Path=/api; SameSite=Strict; Max-Age=0${secure}`;
}

export function AiConnectionStatus() {
  const [status, setStatus] = useState<AiStatus | null>(null);

  const load = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) syncCookie(saved);

      const response = await fetch('/api/ai-status', { cache: 'no-store' });
      const data = await response.json();
      setStatus({
        connected: Boolean(data?.connected),
        provider: data?.provider === 'gemini' ? 'gemini' : 'offline',
        source: typeof data?.source === 'string' ? data.source : null,
      });
    } catch {
      setStatus({ connected: false, provider: 'offline', source: null });
    }
  };

  useEffect(() => {
    void load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const connectLocalKey = async () => {
    const current = localStorage.getItem(STORAGE_KEY) || '';
    const key = window.prompt(
      'Paste your Gemini API key. It will be stored only in this browser on this device and will not be committed to GitHub.',
      current,
    );
    if (key === null) return;

    const trimmed = key.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
      clearCookie();
      await load();
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    syncCookie(trimmed);
    await load();
  };

  const disconnectLocalKey = async () => {
    localStorage.removeItem(STORAGE_KEY);
    clearCookie();
    await load();
  };

  if (!status) {
    return (
      <div className="flex items-center rounded-md border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
        Checking AI…
      </div>
    );
  }

  const localConnection = status.source === 'local-browser';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${
          status.connected
            ? 'border-emerald-500/60 bg-emerald-950 text-emerald-200'
            : 'border-amber-500/60 bg-amber-950 text-amber-200'
        }`}
        title={
          status.connected
            ? localConnection
              ? 'Gemini is connected using a key stored only in this browser on this device.'
              : 'Gemini is connected through the server environment.'
            : 'No AI key was detected. Typed answers will use the offline examiner.'
        }
      >
        <span className={`mr-2 h-2 w-2 rounded-full ${status.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        {status.connected ? (localConnection ? 'AI connected · this laptop' : 'AI connected') : 'Offline fallback'}
      </div>

      {!status.connected ? (
        <button
          type="button"
          onClick={connectLocalKey}
          className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Connect AI
        </button>
      ) : localConnection ? (
        <button
          type="button"
          onClick={disconnectLocalKey}
          className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          Forget key
        </button>
      ) : null}
    </div>
  );
}
