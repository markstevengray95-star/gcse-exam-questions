import { NextRequest, NextResponse } from 'next/server';
import { getRequestAiSource, hasRequestAiKey } from '@/lib/serverAi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const connected = hasRequestAiKey(req);

  return NextResponse.json(
    {
      connected,
      provider: connected ? 'gemini' : 'offline',
      source: connected ? getRequestAiSource(req) : null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
