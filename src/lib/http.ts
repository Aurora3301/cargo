import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function readJson(request: NextRequest): Promise<unknown> {
  if (!sameOrigin(request)) throw new Error('Request origin is not allowed.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Send JSON data.');
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 100_000) throw new Error('File is too large.');
  const body = await request.text();
  if (body.length > 100_000) throw new Error('File is too large.');
  try { return JSON.parse(body); } catch { throw new Error('Invalid JSON.'); }
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Invalid site data.' }, { status: 400 });
  }
  if (error instanceof Error && ['Request origin is not allowed.', 'Send JSON data.', 'File is too large.', 'Invalid JSON.'].includes(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'The local operation failed. Check file permissions and try again.' }, { status: 500 });
}
