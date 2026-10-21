import { NextResponse } from 'next/server';
import { isDatabaseUp } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const database = await isDatabaseUp();
  return NextResponse.json({ ok: database, database }, { status: database ? 200 : 503 });
}
