import { NextResponse } from 'next/server';
import { getServerAiSource, hasServerAiKey } from '@/lib/serverAi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connected = hasServerAiKey();

  return NextResponse.json(
    {
      connected,
      provider: connected ? 'gemini' : 'offline',
      source: connected ? getServerAiSource() : null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
