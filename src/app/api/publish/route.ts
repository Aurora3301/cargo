import { NextRequest, NextResponse } from 'next/server';
import { getSite, saveSite } from '@/lib/store';
import { renderSite } from '@/lib/publish';
import { publishSite } from '@/lib/publish-server';
import { errorResponse, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const site = saveSite(await readJson(request));
    const folder = publishSite(site);
    return NextResponse.json({ folder, message: 'Static site published locally.' });
  } catch (error) { return errorResponse(error); }
}

export async function GET() {
  try {
    const html = renderSite(getSite());
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': 'attachment; filename="portfolio.html"', 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
