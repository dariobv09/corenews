// API Route to fetch current news and reports (for dynamic UI updates)
import { NextResponse } from 'next/server';
import { getLatestNews, getLatestReports } from '@/lib/data';
import { checkAndTriggerUpdateIfNeeded } from '@/lib/agents/coordinator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Trigger background check for new news items without blocking the UI response
    checkAndTriggerUpdateIfNeeded().catch((err) => {
      console.error('Error en comprobación de actualización automática:', err);
    });

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
