import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { mimeType: true, data: true } });
  if (!asset) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(Buffer.from(asset.data), {
    headers: {
      'Content-Type': asset.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
