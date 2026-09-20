export function getServerAiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
}

export function hasServerAiKey() {
  return Boolean(getServerAiKey());
}

export function getServerAiSource() {
  if ((process.env.GEMINI_API_KEY || '').trim()) return 'GEMINI_API_KEY';
  if ((process.env.GOOGLE_API_KEY || '').trim()) return 'GOOGLE_API_KEY';
  return null;
}
