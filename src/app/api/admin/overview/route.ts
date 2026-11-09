/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';
import { calculateLeadAge } from '@/lib/leadAge';

export async function GET(request: Request) {
  const { isAdmin, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    // Fetch all users, clients, and tasks in parallel
    const [
      { data: usersRaw, error: usersErr },
      { data: clientsRaw, error: clientsErr },
      { data: tasksRaw, error: tasksErr },
      { data: nichesRaw },
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('niches').select('*'),
    ]);

    if (usersErr) console.error('Admin users error:', usersErr.message);
    if (clientsErr) console.error('Admin clients error:', clientsErr.message);
    if (tasksErr) console.error('Admin tasks error:', tasksErr.message);

    const users = usersRaw || [];
    const clients = clientsRaw || [];
    const tasks = tasksRaw || [];
    const niches = nichesRaw || [];

    // Map user_id to user profile
    const userMap = new Map<string, any>();
    users.forEach((u) => userMap.set(u.id, u));

    // Global Org Metrics
    const totalPipelineValue = clients.reduce((sum, c) => sum + (Number(c.deal_value) || 0), 0);
    const totalLeads = clients.length;
    const wonLeads = clients.filter((c) => ['approved', 'completed', 'won'].includes(c.status?.toLowerCase())).length;
    const globalConversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status?.toLowerCase() === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;

    // Agent Performance Breakdown
    const agentMetrics = users.map((agent) => {
      const agentClients = clients.filter((c) => c.user_id === agent.id);
      const agentTasks = tasks.filter((t) => t.user_id === agent.id);
      const agentNiches = niches.filter((n) => n.user_id === agent.id);

      const agentPipelineVal = agentClients.reduce((sum, c) => sum + (Number(c.deal_value) || 0), 0);
      const agentWon = agentClients.filter((c) => ['approved', 'completed', 'won'].includes(c.status?.toLowerCase())).length;
      const agentWinRate = agentClients.length > 0 ? Math.round((agentWon / agentClients.length) * 100) : 0;

      const agentOpenTasks = agentTasks.filter((t) => t.status?.toLowerCase() !== 'completed').length;
      const agentStaleLeads = agentClients.filter((c) => calculateLeadAge(c.created_at).status === 'stale').length;

      // Activity rating
      let performanceGrade: 'A+' | 'A' | 'B' | 'Needs Review' = 'B';
      if (agentWinRate >= 25 || agentPipelineVal >= 50000) performanceGrade = 'A+';
      else if (agentWinRate >= 15 || agentPipelineVal >= 20000) performanceGrade = 'A';
      else if (agentStaleLeads > 5 && agentWinRate < 10) performanceGrade = 'Needs Review';

      return {
        id: agent.id,
        email: agent.email,
        displayName: agent.display_name || agent.email.split('@')[0],
        avatarUrl: agent.avatar_url,
        role: agent.role || 'user',
        isActive: agent.is_active ?? true,
        lastLogin: agent.last_login,
        createdAt: agent.created_at,
        leadsCount: agentClients.length,
        pipelineValue: agentPipelineVal,
        wonCount: agentWon,
        winRate: agentWinRate,
        openTasksCount: agentOpenTasks,
        completedTasksCount: agentTasks.length - agentOpenTasks,
        staleLeadsCount: agentStaleLeads,
        nichesCount: agentNiches.length,
        performanceGrade,
      };
    });

    // Cross-Agent Recent Leads with Agent Names
    const crossAgentLeads = clients.slice(0, 10).map((c) => {
      const owner = userMap.get(c.user_id);
      const ageInfo = calculateLeadAge(c.created_at);
      return {
        id: c.id,
        name: c.name,
        company: c.company,
        phone: c.phone,
        email: c.email,
        status: c.status,
        dealValue: Number(c.deal_value) || 0,
        leadScore: Number(c.lead_score) || 50,
        createdAt: c.created_at,
        leadAge: ageInfo,
        agentId: c.user_id,
        agentName: owner?.display_name || owner?.email?.split('@')[0] || 'Unassigned Agent',
        agentEmail: owner?.email || '',
      };
    });

    return NextResponse.json({
      success: true,
      globalStats: {
        totalPipelineValue,
        totalLeads,
        wonLeads,
        globalConversionRate,
        totalAgents: users.length,
        totalTasks,
        pendingTasks,
        completedTasks,
      },
      agents: agentMetrics,
      recentLeads: crossAgentLeads,
    });
  } catch (err: any) {
    console.error('[/api/admin/overview Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
