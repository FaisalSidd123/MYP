/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';

// GET: Retrieve all organization tasks across all agents
export async function GET(request: Request) {
  const { isAdmin, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agent_id');
    const status = url.searchParams.get('status');

    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

    if (agentId && agentId !== 'all') {
      query = query.eq('user_id', agentId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const [{ data: tasksRaw, error: tasksErr }, { data: usersRaw }, { data: clientsRaw }] = await Promise.all([
      query,
      supabase.from('users').select('id, email, display_name, avatar_url'),
      supabase.from('clients').select('id, name, company'),
    ]);

    if (tasksErr) {
      console.error('[/api/admin/tasks GET Error]:', tasksErr.message);
      return NextResponse.json({ error: tasksErr.message }, { status: 500 });
    }

    const userMap = new Map<string, any>();
    (usersRaw || []).forEach((u) => userMap.set(u.id, u));

    const clientMap = new Map<string, any>();
    (clientsRaw || []).forEach((c) => clientMap.set(c.id, c));

    const enrichedTasks = (tasksRaw || []).map((t) => {
      const assignee = userMap.get(t.user_id);
      const client = t.client_id ? clientMap.get(t.client_id) : null;

      // Extract priority if formatted in description or column
      let priority = t.priority || 'medium';
      if (!t.priority && t.description?.includes('[Priority:')) {
        const match = t.description.match(/\[Priority:\s*(\w+)\]/i);
        if (match) priority = match[1].toLowerCase();
      }

      return {
        ...t,
        priority,
        assigneeName: assignee?.display_name || assignee?.email?.split('@')[0] || 'Unassigned',
        assigneeEmail: assignee?.email || '',
        assigneeAvatar: assignee?.avatar_url || null,
        clientName: client?.name || null,
        clientCompany: client?.company || null,
      };
    });

    return NextResponse.json({ tasks: enrichedTasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Admin assigns a task to an agent
export async function POST(request: Request) {
  const { isAdmin, email: adminEmail, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { assigned_to_user_id, client_id, title, description, due_date, priority = 'medium', status = 'pending' } = body;

    if (!assigned_to_user_id) {
      return NextResponse.json({ error: 'Missing required field: assigned_to_user_id' }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
    }

    // Format admin delegation note into description
    const adminNote = `[Assigned by Admin: ${adminEmail || 'Owner'} | Priority: ${priority.toUpperCase()}]`;
    const fullDescription = description?.trim() ? `${adminNote}\n${description.trim()}` : adminNote;

    // Primary insert with priority
    const { data, error: insertErr } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: assigned_to_user_id,
          client_id: client_id || null,
          title: title.trim(),
          description: fullDescription,
          due_date: due_date || null,
          status,
        },
      ])
      .select()
      .single();

    if (insertErr) {
      console.error('[/api/admin/tasks POST Error]:', insertErr.message);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Admin updates task status or reassigns
export async function PUT(request: Request) {
  const { isAdmin, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, title, description, due_date, assigned_to_user_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (status) updatePayload.status = status;
    if (title) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description;
    if (due_date !== undefined) updatePayload.due_date = due_date;
    if (assigned_to_user_id) updatePayload.user_id = assigned_to_user_id;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error: updateErr } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Admin removes a task
export async function DELETE(request: Request) {
  const { isAdmin, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    const { error: delErr } = await supabase.from('tasks').delete().eq('id', id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
