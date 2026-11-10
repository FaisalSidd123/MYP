/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authMiddleware';

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveOrgScope(userId: string, orgId?: string | null) {
  if (!orgId) {
    return { orgId: null, slug: 'office-sales', isPrimary: true, isPersonal: false };
  }

  if (isValidUuid(orgId)) {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, slug, name')
        .eq('id', orgId)
        .single();

      if (org) {
        const slug = org.slug?.toLowerCase() || '';
        const isPersonal = slug.includes('personal');
        const isPrimary = !isPersonal;
        return { orgId, slug, isPrimary, isPersonal };
      }
    } catch (err) {
      console.warn('Could not query organization by id:', err);
    }
  }

  // Virtual mode fallback (e.g. 'default-office-sales' or 'default-personal-brand')
  const lower = orgId.toLowerCase();
  const isPersonal = lower.includes('personal');
  const isPrimary = !isPersonal;
  const slug = isPersonal ? 'personal-brand' : 'office-sales';
  return { orgId, slug, isPrimary, isPersonal };
}

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const nicheId = url.searchParams.get('niche_id');
  const orgId = url.searchParams.get('org_id') || request.headers.get('x-org-id');
  const orgScope = await resolveOrgScope(userId, orgId);

  try {
    // Date boundaries for "Today"
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch user's clients
    const clientsQuery = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: clientsRaw, error: clientsError } = await clientsQuery;

    if (clientsError) {
      console.error('[/api/dashboard/stats clients error]:', clientsError.message);
    }
    let allClients = clientsRaw || [];

    if (orgScope.orgId) {
      if (orgScope.isPersonal) {
        allClients = allClients.filter((c: any) => {
          if (c.org_id && isValidUuid(c.org_id) && isValidUuid(orgScope.orgId)) {
            return c.org_id === orgScope.orgId;
          }
          return (
            c.org_id === orgScope.orgId ||
            c.source?.toLowerCase().includes('personal') ||
            c.pitch_notes?.includes('[org:personal-brand]')
          );
        });
      } else {
        allClients = allClients.filter((c: any) => {
          const isPersonal =
            (c.org_id && c.org_id !== orgScope.orgId && isValidUuid(c.org_id)) ||
            c.source?.toLowerCase().includes('personal') ||
            c.pitch_notes?.includes('[org:personal-brand]');
          if (isPersonal) return false;

          if (c.org_id && isValidUuid(c.org_id) && isValidUuid(orgScope.orgId)) {
            return !c.org_id || c.org_id === orgScope.orgId;
          }
          return true;
        });
      }
    }

    // Fetch user's niches
    const nichesQuery = supabase
      .from('niches')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    const { data: nichesRaw, error: nichesError } = await nichesQuery;

    if (nichesError) {
      console.error('[/api/dashboard/stats niches error]:', nichesError.message);
    }
    let allNiches = nichesRaw || [];

    if (orgScope.orgId) {
      if (orgScope.isPersonal) {
        allNiches = allNiches.filter((n: any) => {
          if (n.org_id && isValidUuid(n.org_id) && isValidUuid(orgScope.orgId)) {
            return n.org_id === orgScope.orgId;
          }
          return (
            n.org_id === orgScope.orgId ||
            n.description?.includes('[org:personal-brand]') ||
            n.name?.toLowerCase().includes('personal')
          );
        });
      } else {
        allNiches = allNiches.filter((n: any) => {
          const isPersonal =
            (n.org_id && n.org_id !== orgScope.orgId && isValidUuid(n.org_id)) ||
            n.description?.includes('[org:personal-brand]') ||
            n.name?.toLowerCase().includes('personal');
          if (isPersonal) return false;

          if (n.org_id && isValidUuid(n.org_id) && isValidUuid(orgScope.orgId)) {
            return !n.org_id || n.org_id === orgScope.orgId;
          }
          return true;
        });
      }
    }

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
