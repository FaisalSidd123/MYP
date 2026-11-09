/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAdmin, isUserAdmin } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request) {
  const { isAdmin, error } = await verifyAdmin(request);
  if (!isAdmin || error) {
    return error || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { target_user_id, role, is_active } = body;

    if (!target_user_id) {
      return NextResponse.json({ error: 'Missing target_user_id' }, { status: 400 });
    }

    // Fetch target user to ensure we do not demote the permanent owner
    const { data: targetUser, error: fetchErr } = await supabase
      .from('users')
      .select('email')
      .eq('id', target_user_id)
      .single();

    if (fetchErr || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (isUserAdmin(targetUser.email) && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot revoke administrator rights from the primary owner account.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (role && ['admin', 'user'].includes(role)) {
      updates.role = role;
    }
    if (typeof is_active === 'boolean') {
      updates.is_active = is_active;
    }

    const { data, error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', target_user_id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
