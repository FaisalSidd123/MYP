/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { isUserAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const { uid: authUserId, email: authEmail, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const user = await request.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Missing required user fields' }, { status: 400 });
    }

    const effectiveEmail = authEmail || user.email;
    const shouldBeAdmin = isUserAdmin(effectiveEmail);

    const upsertPayload: Record<string, any> = {
      id: authUserId,
      email: effectiveEmail,
      display_name: user.display_name || null,
      avatar_url: user.avatar_url || null,
      last_login: new Date().toISOString(),
    };

    if (shouldBeAdmin) {
      upsertPayload.role = 'admin';
    }

    // Upsert the user into the Supabase 'users' table
    const { data, error } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase user sync error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
