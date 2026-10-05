import { NextRequest, NextResponse } from 'next/server';
import { getSite, saveSite } from '@/lib/store';
import { errorResponse, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return NextResponse.json(getSite(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return errorResponse(error); }
}

export async function PUT(request: NextRequest) {
  try { return NextResponse.json(saveSite(await readJson(request))); }
  catch (error) { return errorResponse(error); }
}
