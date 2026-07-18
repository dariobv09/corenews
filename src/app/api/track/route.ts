import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { session_id, is_new_visitor, page } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        // Try standard queries to manage daily page views
        const { data: existing, error: queryError } = await supabaseAdmin
          .from('page_views_daily')
          .select('*')
          .eq('date', todayStr)
          .maybeSingle();

        if (queryError && queryError.code !== 'PGRST116') {
          throw queryError;
        }

        if (existing) {
          const { error: updateError } = await supabaseAdmin
            .from('page_views_daily')
            .update({
              views_count: existing.views_count + 1,
              unique_visitors: existing.unique_visitors + (is_new_visitor ? 1 : 0)
            })
            .eq('date', todayStr);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabaseAdmin
            .from('page_views_daily')
            .insert({
              date: todayStr,
              views_count: 1,
              unique_visitors: is_new_visitor ? 1 : 0
            });
          if (insertError) throw insertError;
        }

        // Upsert active session
        const { error: upsertError } = await supabaseAdmin
          .from('active_sessions')
          .upsert({
            session_id,
            last_active: new Date().toISOString()
          });
        if (upsertError) throw upsertError;

        // Delete old sessions (older than 5 minutes)
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        await supabaseAdmin
          .from('active_sessions')
          .delete()
          .lt('last_active', fiveMinAgo);

      } catch (dbErr: any) {
        // Catch 42P01 error (relation does not exist) or missing table errors
        if (dbErr.code === '42P01' || dbErr.message?.includes('does not exist')) {
          console.warn('Supabase analytics tables not created yet. Tracking fallback skipped.');
        } else {
          throw dbErr;
        }
      }
    } else {
      // Mock Store tracking
      mockStore.trackVisit(todayStr, session_id, is_new_visitor);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error tracking analytics:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
