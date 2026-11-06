import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  // Allow user to reset/disable MFA using their authenticated Firebase session
  const { uid: authUserId, error: authError } = await verifyAuth(request, false);
  if (authError) return authError;

  try {
    const { error: dbError } = await supabase
      .from('users')
      .update({
        mfa_enabled: false,
        mfa_secret: null,
        mfa_verified_at: new Date().toISOString()
      })
      .eq('id', authUserId);

    if (dbError) {
      console.error('Failed to reset MFA in database:', dbError);
      return NextResponse.json({ error: 'Failed to reset MFA in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Two-Factor Authentication has been successfully disabled.'
    });
  } catch (error: unknown) {
    console.error('MFA reset error:', error);
    return NextResponse.json({ error: 'Internal server error while resetting MFA' }, { status: 500 });
  }
}

