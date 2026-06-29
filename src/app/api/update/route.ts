// API Route to trigger the multi-agent update cycle
import { NextResponse } from 'next/server';
import { executeUpdatePipeline, executeRewritePipeline } from '@/lib/agents/coordinator';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Optionally check for CRON authorization or secret headers if coming from Vercel Crons
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If a CRON secret is set, we require it to authorize GET/POST cron requests
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow manual clicks from localhost or the same origin
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const isSameHost = referer && origin && referer.startsWith(origin);
      
      if (!isSameHost) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
    }

    // Parse mode query parameter (e.g. /api/update?mode=rewrite)
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'rewrite') {
      await executeRewritePipeline();

      return NextResponse.json({
        status: 'success',
        message: 'El sistema de re-redacción de todos los artículos existentes se ha completado.'
      });
    } else {
      const result = await executeUpdatePipeline();

      return NextResponse.json({
        status: result.success ? 'success' : 'failed',
        message: result.success
          ? 'El proceso de investigación, verificación y actualización diaria ha concluido con éxito.'
          : `El proceso de actualización falló: ${result.error}`
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}

// Support GET for testing or simple cron calls
export async function GET(request: Request) {
  // We can treat GET the same as POST for simple cron triggers (e.g. Vercel Cron routes)
  return POST(request);
}
