/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Virtual fallback organizations if table is not yet created in Supabase
const VIRTUAL_DEFAULT_ORGS = [
  {
    id: 'default-office-sales',
    name: 'Office Sales',
    slug: 'office-sales',
    role: 'owner',
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-personal-brand',
    name: 'Personal Brand',
    slug: 'personal-brand',
    role: 'owner',
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    // 1. Fetch user's organizations via organization_members
    const { data: memberRows, error: memberErr } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations (*)')
      .eq('user_id', authUserId);

    if (memberErr) {
      console.warn('[/api/organizations GET Notice]:', memberErr.message);
      // If table does not exist yet (PGRST204 / 42P01), return virtual orgs
      return NextResponse.json(VIRTUAL_DEFAULT_ORGS);
    }

    // 2. If user already has organizations, return them
    if (memberRows && memberRows.length > 0) {
      const orgs = memberRows
        .filter((m: any) => m.organizations)
        .map((m: any) => ({
          ...m.organizations,
          role: m.role || 'member',
        }));

      if (orgs.length > 0) {
        // Automatically backfill any existing unassigned records to primary organization (Office Sales)
        const primaryOrgId = orgs[0].id;
        if (primaryOrgId && isValidUuid(primaryOrgId)) {
          await Promise.allSettled([
            supabase.from('clients').update({ org_id: primaryOrgId }).eq('user_id', authUserId).is('org_id', null),
            supabase.from('niches').update({ org_id: primaryOrgId }).eq('user_id', authUserId).is('org_id', null),
            supabase.from('tasks').update({ org_id: primaryOrgId }).eq('user_id', authUserId).is('org_id', null),
            supabase.from('schedules').update({ org_id: primaryOrgId }).eq('user_id', authUserId).is('org_id', null),
          ]);
        }
        return NextResponse.json(orgs);
      }
    }

    // 3. Auto-provision default organizations for new or unassigned user:
    // Create "Office Sales" and "Personal Brand"
    const { data: officeOrg, error: officeErr } = await supabase
      .from('organizations')
      .insert([{
        name: 'Office Sales',
        slug: 'office-sales',
        owner_id: authUserId,
      }])
      .select()
      .single();

    if (officeErr) {
      console.warn('Failed to auto-create Office Sales org:', officeErr.message);
      return NextResponse.json(VIRTUAL_DEFAULT_ORGS);
    }

    const { data: personalOrg } = await supabase
      .from('organizations')
      .insert([{
        name: 'Personal Brand',
        slug: 'personal-brand',
        owner_id: authUserId,
      }])
      .select()
      .single();

    // Add memberships as owner
    await supabase.from('organization_members').insert([
      { org_id: officeOrg.id, user_id: authUserId, role: 'owner' },
      ...(personalOrg ? [{ org_id: personalOrg.id, user_id: authUserId, role: 'owner' }] : []),
    ]);

    // Attach any existing unassigned records to the primary Office Sales organization
    if (officeOrg?.id) {
      await Promise.allSettled([
        supabase.from('clients').update({ org_id: officeOrg.id }).eq('user_id', authUserId).is('org_id', null),
        supabase.from('niches').update({ org_id: officeOrg.id }).eq('user_id', authUserId).is('org_id', null),
        supabase.from('tasks').update({ org_id: officeOrg.id }).eq('user_id', authUserId).is('org_id', null),
        supabase.from('schedules').update({ org_id: officeOrg.id }).eq('user_id', authUserId).is('org_id', null),
      ]);
    }

    const result = [
      { ...officeOrg, role: 'owner' },
      ...(personalOrg ? [{ ...personalOrg, role: 'owner' }] : []),
    ];

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/organizations Unexpected Error]:', error);
    return NextResponse.json(VIRTUAL_DEFAULT_ORGS);
  }
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `org-${Date.now()}`;

    // 1. Create Organization in database
    const { data: newOrg, error: orgErr } = await supabase
      .from('organizations')
      .insert([{
        name: trimmedName,
        slug,
        owner_id: authUserId,
      }])
      .select()
      .single();

    if (orgErr) {
      console.warn('Failed to insert into organizations table:', orgErr.message);
      // Fallback virtual response if tables not created yet
      return NextResponse.json({
        id: `org-virtual-${Date.now()}`,
        name: trimmedName,
        slug,
        role: 'owner',
        created_at: new Date().toISOString(),
      }, { status: 201 });
    }

    // 2. Add creator as owner in organization_members
    await supabase.from('organization_members').insert([{
      org_id: newOrg.id,
      user_id: authUserId,
      role: 'owner',
    }]);

    return NextResponse.json({
      ...newOrg,
      role: 'owner',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create organization' }, { status: 500 });
  }
}

