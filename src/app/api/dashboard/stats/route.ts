import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {

    // Date boundaries for "Today"
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run aggregate queries concurrently via Promise.all for maximum performance
    const [
      { count: totalContacts },
      { count: schedulesToday },
      { count: pendingTasks },
      { count: completedTasks },
      { data: upcomingSchedules },
      { data: recentTasks }
    ] = await Promise.all([
      // 1. Total Contacts
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // 2. Schedules Today
      supabase.from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString()),
      // 3. Pending Tasks
      supabase.from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'completed'),
      // 4. Completed Tasks
      supabase.from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      // 5. Upcoming Schedules
      supabase.from('schedules')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4),
      // 6. Recent Activity (Latest Tasks)
      supabase.from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    return NextResponse.json({
      stats: {
        totalContacts: totalContacts || 0,
        schedulesToday: schedulesToday || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
      },
      upcomingSchedules: upcomingSchedules || [],
      recentActivity: recentTasks || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
