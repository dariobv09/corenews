// API Route to fetch current news and reports (for dynamic UI updates)
import { NextResponse } from 'next/server';
import { getLatestNews, getLatestReports } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const noticias = await getLatestNews();
    const informes = await getLatestReports();
    
    return NextResponse.json({
      noticias,
      informes
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 }
    );
  }
}
