/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const nicheId = url.searchParams.get('niche_id');

  try {
    // Date boundaries for "Today"
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch user's clients
    const { data: clientsRaw, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, company, email, phone, status, deal_value, niche_id, niche_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.error('[/api/dashboard/stats clients error]:', clientsError.message);
    }
    const allClients = clientsRaw || [];

    // Fetch user's niches
    const { data: nichesRaw, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (nichesError) {
      console.error('[/api/dashboard/stats niches error]:', nichesError.message);
    }
    const allNiches = nichesRaw || [];

    // Filter clients if nicheId provided
    const isFiltered = Boolean(nicheId && nicheId !== 'all');
    const filteredClients = isFiltered
      ? allClients.filter((c: any) => c.niche_id === nicheId)
      : allClients;

    // Aggregate Client Metrics
    const totalContacts = filteredClients.length;
    const totalPipelineValue = filteredClients.reduce((sum: number, c: any) => sum + (Number(c.deal_value) || 0), 0);
    const activeDeals = filteredClients.filter((c: any) => {
      const s = c.status?.toLowerCase();
      return ['contacted', 'demo_required', 'demo_sent', 'follow_up', 'negotiation', 'postponed'].includes(s);
    }).length;
    const wonDeals = filteredClients.filter((c: any) => {
      const s = c.status?.toLowerCase();
      return ['won', 'approved', 'completed'].includes(s);
    }).length;
    const conversionRate = totalContacts > 0 ? Math.round((wonDeals / totalContacts) * 100) : 0;

    // Run parallel queries for Schedules & Tasks
    const [
      { count: schedulesToday },
      { count: pendingTasks },
      { count: completedTasks },
      { data: upcomingSchedules },
      { data: recentTasks }
    ] = await Promise.all([
      supabase.from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString()),
      supabase.from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'completed'),
      supabase.from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase.from('schedules')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4),
      supabase.from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Build Niche Summaries for Categorized Breakdown
    const nichesSummary = allNiches.map((niche: any) => {
      const nicheClients = allClients.filter((c: any) => c.niche_id === niche.id || c.niche_name?.toLowerCase() === niche.name?.toLowerCase());
      const count = nicheClients.length;
      const value = nicheClients.reduce((sum: number, c: any) => sum + (Number(c.deal_value) || 0), 0);
      const won = nicheClients.filter((c: any) => ['approved', 'completed'].includes(c.status?.toLowerCase())).length;
      const rate = count > 0 ? Math.round((won / count) * 100) : 0;

      return {
        id: niche.id,
        name: niche.name,
        description: niche.description,
        color: niche.color || 'indigo',
        icon: niche.icon || 'category',
        target_deal_size: Number(niche.target_deal_size) || 0,
        leadCount: count,
        pipelineValue: value,
        wonDeals: won,
        conversionRate: rate,
      };
    });

    // Recent leads (first 6)
    const recentLeads = filteredClients.slice(0, 6);

    return NextResponse.json({
      isFiltered,
      selectedNicheId: isFiltered ? nicheId : null,
      stats: {
        totalContacts,
        totalPipelineValue,
        activeDeals,
        wonDeals,
        conversionRate,
        schedulesToday: schedulesToday || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
      },
      niches: allNiches,
      nichesSummary,
      recentLeads,
      upcomingSchedules: upcomingSchedules || [],
      recentActivity: recentTasks || []
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[/api/dashboard/stats Exception]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
