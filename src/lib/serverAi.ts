import type { NextRequest } from 'next/server';

const LOCAL_KEY_COOKIE = 'gcseScienceGeminiKey';

export function getServerAiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
}

export function getRequestAiKey(req?: NextRequest) {
  const serverKey = getServerAiKey();
  if (serverKey) return serverKey;

  const localKey = req?.cookies.get(LOCAL_KEY_COOKIE)?.value;
  if (!localKey) return '';

  try {
    return decodeURIComponent(localKey).trim();
  } catch {
    return localKey.trim();
  }
}

export function hasServerAiKey() {
  return Boolean(getServerAiKey());
}

export function hasRequestAiKey(req?: NextRequest) {
  return Boolean(getRequestAiKey(req));
}

export function getRequestAiSource(req?: NextRequest) {
  if ((process.env.GEMINI_API_KEY || '').trim()) return 'GEMINI_API_KEY';
  if ((process.env.GOOGLE_API_KEY || '').trim()) return 'GOOGLE_API_KEY';
  if (req?.cookies.get(LOCAL_KEY_COOKIE)?.value) return 'local-browser';
  return null;
}
