import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { verify } from 'otplib';

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request, false);
  if (authError) return authError;

  try {
    const body = await request.json();
    const rawCode = body?.code;

    if (!rawCode) {
      return NextResponse.json({ error: 'MFA code is required' }, { status: 400 });
    }

    const code = String(rawCode).trim().replace(/\s+/g, '');

    if (code.length !== 6) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 });
    }

    // Retrieve the user to get their MFA secret
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('mfa_secret, mfa_enabled')
      .eq('id', authUserId)
      .single();

    if (fetchError || !user || !user.mfa_secret) {
      return NextResponse.json({ 
        error: 'No MFA secret found on your account. Please set up 2FA or click Reset 2FA.',
        needs_setup: true 
      }, { status: 400 });
    }

    // Verify the TOTP code with ±60s clock drift tolerance (epochTolerance: 60)
    const result = await verify({
      token: code,
      secret: user.mfa_secret,
      epochTolerance: 60
    });

    if (!result.valid) {
      return NextResponse.json({ 
        error: 'Invalid or expired code. Ensure your device time is synchronized, or try generating a new code.',
        details: 'TOTP validation failed'
      }, { status: 401 });
    }

    // Officially mark MFA as verified for this session
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
         mfa_enabled: true,
         mfa_verified_at: new Date().toISOString()
      })
      .eq('id', authUserId);

    if (updateError) {
      console.error('Failed to update MFA status:', updateError);
      return NextResponse.json({ error: 'Code verified but failed to update session state in database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Two-Factor Authentication verified successfully' });
  } catch (error: unknown) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: 'Internal server error while verifying MFA' }, { status: 500 });
  }
}
