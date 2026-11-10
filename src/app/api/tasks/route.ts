/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

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
  const orgId = url.searchParams.get('org_id') || request.headers.get('x-org-id');
  const orgScope = await resolveOrgScope(userId, orgId);

  const query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[/api/tasks GET Error]:', error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let filtered = data || [];
  if (orgScope.orgId) {
    if (orgScope.isPersonal) {
      filtered = filtered.filter((t: any) => {
        if (t.org_id && isValidUuid(t.org_id) && isValidUuid(orgScope.orgId)) {
          return t.org_id === orgScope.orgId;
        }
        return (
          t.org_id === orgScope.orgId ||
          t.description?.includes('[org:personal-brand]') ||
          t.title?.toLowerCase().includes('personal')
        );
      });
    } else {
      filtered = filtered.filter((t: any) => {
        const isPersonal =
          (t.org_id && t.org_id !== orgScope.orgId && isValidUuid(t.org_id)) ||
          t.description?.includes('[org:personal-brand]') ||
          t.title?.toLowerCase().includes('personal');
        if (isPersonal) return false;

        if (t.org_id && isValidUuid(t.org_id) && isValidUuid(orgScope.orgId)) {
          return !t.org_id || t.org_id === orgScope.orgId;
        }
        return true;
      });
    }
  }

  const cleaned = filtered.map((t: any) => ({
    ...t,
    description: t.description ? t.description.replace(/\[org:personal-brand\]/g, '').trim() : ''
  }));

  return NextResponse.json(cleaned);
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { client_id, title, description, due_date, status } = body;
    const user_id = authUserId;

    if (!title || !status) {
      return NextResponse.json({ error: 'Missing required fields: title, status' }, { status: 400 });
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(authUserId, rawOrgId);
    const orgId = (rawOrgId && isValidUuid(rawOrgId)) ? rawOrgId : null;

    let finalDesc = description?.trim() || '';
    if (orgScope.isPersonal && !finalDesc.includes('[org:personal-brand]')) {
      finalDesc = finalDesc ? `${finalDesc} [org:personal-brand]` : '[org:personal-brand]';
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id, org_id: orgId || null, client_id, title, description: finalDesc, due_date, status }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update an existing task
export async function PUT(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, client_id, title, description, due_date, status } = body;
    const user_id = authUserId;

    console.log('PUT request received:', { id, user_id, title, status }); // Debug log

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    if (!title || !status) {
      return NextResponse.json({ error: 'Title and status are required' }, { status: 400 });
    }

    // Prepare update data (only include fields that exist in the table)
    const updateData: any = {
      title,
      description,
      status,
    };

    // Only add client_id if provided
    if (client_id) updateData.client_id = client_id;

    // Only add due_date if provided
    if (due_date) updateData.due_date = due_date;

    // Only add updated_at if the column exists (or remove if not needed)
    // updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    console.log('Update result:', { data, error }); // Debug log

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a task
export async function DELETE(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}