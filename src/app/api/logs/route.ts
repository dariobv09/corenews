// API Route to fetch agent logs and system state
import { NextResponse } from 'next/server';
import { getAgentLogs } from '@/lib/agents/coordinator';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    const { logs, isUpdating, lastUpdated } = getAgentLogs();
    
    return NextResponse.json({
      logs,
      isUpdating,
      lastUpdated,
      isSupabaseConfigured: isSupabaseConfigured()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 }
    );
  }
}
