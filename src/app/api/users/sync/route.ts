/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { uid: authUserId, email: authEmail, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const user = await request.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Missing required user fields' }, { status: 400 });
    }

    // Upsert the user into the Supabase 'users' table
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUserId,
          email: authEmail || user.email,
          display_name: user.display_name || null,
          avatar_url: user.avatar_url || null,
          last_login: new Date().toISOString(),
          // role and is_active will use DB defaults or preserve existing on conflict
        },
        { onConflict: 'id' }
      )
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
