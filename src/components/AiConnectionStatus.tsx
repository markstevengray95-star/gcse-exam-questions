"use client";

import { useEffect, useState } from 'react';

type AiStatus = {
  connected: boolean;
  provider: 'gemini' | 'offline';
  source: string | null;
};

export function AiConnectionStatus() {
  const [status, setStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/ai-status', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled) {
          setStatus({
            connected: Boolean(data?.connected),
            provider: data?.provider === 'gemini' ? 'gemini' : 'offline',
            source: typeof data?.source === 'string' ? data.source : null,
          });
        }
      } catch {
        if (!cancelled) setStatus({ connected: false, provider: 'offline', source: null });
      }
    };

    void load();
    const interval = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (!status) {
    return (
      <div className="flex items-center rounded-md border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
        Checking AI…
      </div>
    );
  }

  return (
    <div
      className={`flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${
        status.connected
          ? 'border-emerald-500/60 bg-emerald-950 text-emerald-200'
          : 'border-amber-500/60 bg-amber-950 text-amber-200'
      }`}
      title={
        status.connected
          ? `Gemini is connected through the server environment (${status.source}). The key is never sent to the browser.`
          : 'No server AI key was detected. Typed answers will fall back to the offline examiner automatically.'
      }
    >
      <span className={`mr-2 h-2 w-2 rounded-full ${status.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {status.connected ? 'AI connected' : 'Offline fallback'}
    </div>
  );
}
