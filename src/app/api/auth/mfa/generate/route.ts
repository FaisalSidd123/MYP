import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { generateSecret, generateURI } from 'otplib';
import qrcode from 'qrcode';

export async function POST(request: Request) {
  const { uid: authUserId, email, error: authError } = await verifyAuth(request, false);
  if (authError) return authError;

  try {
    // Generate a secure secret for the user
    const secret = generateSecret();

    // Create an otpauth URL for apps like Google Authenticator
    const otpauth = generateURI({
      strategy: 'totp',
      issuer: 'ContactHub',
      label: email || `User_${authUserId.substring(0, 5)}`,
      secret
    });

    // Convert the URL into a QR code data URI
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Store the secret in Supabase but do NOT enable MFA yet
    const { error: dbError } = await supabase
      .from('users')
      .update({
        mfa_secret: secret,
        mfa_enabled: false
      })
      .eq('id', authUserId);

    if (dbError) {
      console.error('Failed to store MFA secret:', dbError);
      return NextResponse.json({ error: 'Failed to initialize MFA on the database' }, { status: 500 });
    }

    return NextResponse.json({
      secret,
      qrCodeUrl
    });
  } catch (error: any) {
    console.error('MFA generate error:', error);
    return NextResponse.json({ error: 'Internal server error while generating MFA' }, { status: 500 });
  }
}
