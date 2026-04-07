import { NextResponse } from 'next/server';
import { adminAuth } from './firebaseAdmin';
import { supabase } from '@/lib/supabase';

export async function verifyAuth(request: Request, requireMfa: boolean = true) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      uid: null, 
      error: NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 }) 
    };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (requireMfa) {
      const { data: user, error: dbError } = await supabase
        .from('users')
        .select('mfa_enabled, mfa_verified_at')
        .eq('id', decodedToken.uid)
        .single();

      if (!dbError && user?.mfa_enabled) {
        const authTime = decodedToken.auth_time * 1000;
        const verifiedAt = user.mfa_verified_at ? new Date(user.mfa_verified_at).getTime() : 0;
        
        if (verifiedAt < authTime) {
          return { 
            uid: null, 
            error: NextResponse.json({ error: 'MFA validation required for this session', code: 'mfa_required' }, { status: 403 }) 
          };
        }
      }
    }

    return { uid: decodedToken.uid, email: decodedToken.email, error: null };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return { 
      uid: null, 
      error: NextResponse.json({ error: 'Unauthorized: Invalid auth token' }, { status: 401 }) 
    };
  }
}
