import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { verify } from 'otplib';

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request, false);
  if (authError) return authError;

  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'MFA code is required' }, { status: 400 });
    }

    // Retrieve the user to get their MFA secret
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('mfa_secret, mfa_enabled')
      .eq('id', authUserId)
      .single();

    if (fetchError || !user || !user.mfa_secret) {
      return NextResponse.json({ error: 'MFA setup has not been initiated' }, { status: 400 });
    }

    // Verify the TOTP code
    const result = await verify({
      token: code,
      secret: user.mfa_secret
    });

    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid or expired MFA code' }, { status: 401 });
    }

    // officially mark MFA as verified for this session
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
         mfa_enabled: true,
         mfa_verified_at: new Date().toISOString()
      })
      .eq('id', authUserId);

    if (updateError) {
      console.error('Failed to update MFA status:', updateError);
      return NextResponse.json({ error: 'Code verified but failed to update MFA state' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'MFA Verification successful' });
  } catch (error: any) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: 'Internal server error while verifying MFA' }, { status: 500 });
  }
}
