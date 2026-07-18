import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        // 1. Fetch daily page views for the last 7 days (madrid timezone)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
        
        const { data: pageViews, error: viewsError } = await supabaseAdmin
          .from('page_views_daily')
          .select('*')
          .gte('date', sevenDaysAgo)
          .order('date', { ascending: true });

        if (viewsError) throw viewsError;

        // 2. Fetch active sessions count
        // First clean up sessions older than 5 minutes
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        await supabaseAdmin
          .from('active_sessions')
          .delete()
          .lt('last_active', fiveMinAgo);

        // Now count how many remain
        const { count, error: countError } = await supabaseAdmin
          .from('active_sessions')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        return NextResponse.json({
          success: true,
          pageViews: pageViews || [],
          activeUsers: count || 0,
          tablesNotCreated: false
        });

      } catch (dbErr: any) {
        // Catch 42P01 error (relation does not exist) or missing table errors
        if (dbErr.code === '42P01' || dbErr.message?.includes('does not exist')) {
          console.warn('Supabase analytics tables not created yet. Returning setup flag.');
          return NextResponse.json({
            success: true,
            pageViews: [],
            activeUsers: 0,
            tablesNotCreated: true
          });
        }
        throw dbErr;
      }
    } else {
      // Fallback Mock Store
      const data = mockStore.getAnalyticsData();
      const pageViewsArray = Object.entries(data.pageViews).map(([date, val]: any) => ({
        date,
        views_count: val.views_count,
        unique_visitors: val.unique_visitors
      })).sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        success: true,
        pageViews: pageViewsArray,
        activeUsers: data.activeUsers,
        tablesNotCreated: false
      });
    }
  } catch (err: any) {
    console.error('Error fetching analytics data:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
