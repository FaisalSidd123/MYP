import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';
import { isUserAdmin } from '@/lib/adminCheck';

export { isUserAdmin };

export interface AdminAuthResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: NextResponse | null;
}

/**
 * Verifies that the incoming API request comes from an authorized Administrator.
 */
export async function verifyAdmin(request: Request): Promise<AdminAuthResult> {
  const { uid: userId, email, error: authError } = await verifyAuth(request);
  if (authError || !userId) {
    return { isAdmin: false, error: authError };
  }

  // 1. Direct email pattern match for owner "goodfaisal"
  if (isUserAdmin(email)) {
    return { isAdmin: true, userId, email: email || undefined };
  }

  // 2. Query database for user role
  try {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userProfile && isUserAdmin(email, userProfile.role)) {
      return { isAdmin: true, userId, email: email || undefined };
    }
  } catch (err) {
    console.error('Error verifying admin role in database:', err);
  }

  return {
    isAdmin: false,
    error: NextResponse.json(
      { error: 'Forbidden: Administrator privileges required.' },
      { status: 403 }
    ),
  };
}
