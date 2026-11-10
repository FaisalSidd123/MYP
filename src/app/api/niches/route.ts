/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveOrgScope(userId: string, orgId?: string | null) {
  if (!orgId) {
    return { orgId: null, slug: 'office-sales', isPrimary: true, isPersonal: false };
  }

  if (isValidUuid(orgId)) {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, slug, name')
        .eq('id', orgId)
        .single();

      if (org) {
        const slug = org.slug?.toLowerCase() || '';
        const isPersonal = slug.includes('personal');
        const isPrimary = !isPersonal;
        return { orgId, slug, isPrimary, isPersonal };
      }
    } catch (err) {
      console.warn('Could not query organization by id:', err);
    }
  }

  // Virtual mode fallback (e.g. 'default-office-sales' or 'default-personal-brand')
  const lower = orgId.toLowerCase();
  const isPersonal = lower.includes('personal');
  const isPrimary = !isPersonal;
  const slug = isPersonal ? 'personal-brand' : 'office-sales';
  return { orgId, slug, isPrimary, isPersonal };
}

// GET - Retrieve all niches for the user with aggregated lead metrics
export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const orgId = url.searchParams.get('org_id') || request.headers.get('x-org-id');

  try {
    const orgScope = await resolveOrgScope(userId, orgId);

    // 1. Fetch niches for user
    const nicheQuery = supabase
      .from('niches')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    const { data: niches, error: nichesError } = await nicheQuery;

    if (nichesError) {
      console.error('[/api/niches GET Error]:', nichesError.message);
      return NextResponse.json([]);
    }

    // In-memory filter on niches
    let filteredNiches = niches || [];
    if (orgScope.orgId) {
      if (orgScope.isPersonal) {
        filteredNiches = filteredNiches.filter((n: any) => {
          if (n.org_id && isValidUuid(n.org_id) && isValidUuid(orgScope.orgId)) {
            return n.org_id === orgScope.orgId;
          }
          return (
            n.org_id === orgScope.orgId ||
            n.description?.includes('[org:personal-brand]') ||
            n.name?.toLowerCase().includes('personal')
          );
        });
      } else {
        filteredNiches = filteredNiches.filter((n: any) => {
          const isPersonal =
            (n.org_id && n.org_id !== orgScope.orgId && isValidUuid(n.org_id)) ||
            n.description?.includes('[org:personal-brand]') ||
            n.name?.toLowerCase().includes('personal');
          if (isPersonal) return false;

          if (n.org_id && isValidUuid(n.org_id) && isValidUuid(orgScope.orgId)) {
            return !n.org_id || n.org_id === orgScope.orgId;
          }
          return true;
        });
      }
    }

    // Clean internal tag from description for UI
    filteredNiches = filteredNiches.map((n: any) => ({
      ...n,
      description: n.description ? n.description.replace(/\[org:personal-brand\]/g, '').trim() : ''
    }));

    // 2. Fetch clients to compute per-niche metrics with identical org isolation
    const clientsQuery = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) {
      console.error('[/api/niches clients query Error]:', clientsError.message);
    }

    let clientList = clients || [];
    if (orgScope.orgId) {
      if (orgScope.isPersonal) {
        clientList = clientList.filter((c: any) => {
          if (c.org_id && isValidUuid(c.org_id) && isValidUuid(orgScope.orgId)) {
            return c.org_id === orgScope.orgId;
          }
          return (
            c.org_id === orgScope.orgId ||
            c.source?.toLowerCase().includes('personal') ||
            c.pitch_notes?.includes('[org:personal-brand]')
          );
        });
      } else {
        clientList = clientList.filter((c: any) => {
          const isPersonal =
            (c.org_id && c.org_id !== orgScope.orgId && isValidUuid(c.org_id)) ||
            c.source?.toLowerCase().includes('personal') ||
            c.pitch_notes?.includes('[org:personal-brand]');
          if (isPersonal) return false;
          if (c.org_id && isValidUuid(c.org_id) && isValidUuid(orgScope.orgId)) {
            return !c.org_id || c.org_id === orgScope.orgId;
          }
          return true;
        });
      }
    }

    // Aggregate stats per niche
    const enrichedNiches = filteredNiches.map((niche: any) => {
      const nicheClients = clientList.filter((c: any) => c.niche_id === niche.id || c.niche_name?.toLowerCase() === niche.name?.toLowerCase());
      const totalLeads = nicheClients.length;
      const totalValue = nicheClients.reduce((sum: number, c: any) => sum + (Number(c.deal_value) || 0), 0);
      const converted = nicheClients.filter((c: any) => ['approved', 'completed'].includes(c.status?.toLowerCase())).length;
      const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

      return {
        ...niche,
        totalLeads,
        totalValue,
        converted,
        conversionRate,
      };
    });

    return NextResponse.json(enrichedNiches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[/api/niches Exception]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create a new niche
export async function POST(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, description, color, icon, target_deal_size } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Niche name is required' }, { status: 400 });
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(userId, rawOrgId);
    const orgId = (rawOrgId && isValidUuid(rawOrgId)) ? rawOrgId : null;

    let finalDesc = description?.trim() || '';
    if (orgScope.isPersonal && !finalDesc.includes('[org:personal-brand]')) {
      finalDesc = finalDesc ? `${finalDesc} [org:personal-brand]` : '[org:personal-brand]';
    }

    const { data, error } = await supabase
      .from('niches')
      .insert([{
        user_id: userId,
        org_id: orgId || null,
        name: name.trim(),
        description: finalDesc,
        color: color || 'indigo',
        icon: icon || 'category',
        target_deal_size: Number(target_deal_size) || 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('[/api/niches POST Error]:', error.message);
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return NextResponse.json({
          error: "Table 'niches' has not been created in Supabase yet. Please run the SQL migration in your Supabase SQL Editor."
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Update an existing niche
export async function PUT(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name, description, color, icon, target_deal_size } = body;

    if (!id) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Niche name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('niches')
      .update({
        name: name.trim(),
        description: description?.trim() || '',
        color: color || 'indigo',
        icon: icon || 'category',
        target_deal_size: Number(target_deal_size) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update any clients that have this niche_id so their niche_name stays in sync
    await supabase
      .from('clients')
      .update({ niche_name: name.trim() })
      .eq('niche_id', id)
      .eq('user_id', userId);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Delete a niche
export async function DELETE(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 });
  }

  try {
    // 1. Unlink clients from this niche
    await supabase
      .from('clients')
      .update({ niche_id: null, niche_name: null })
      .eq('niche_id', id)
      .eq('user_id', userId);

    // 2. Delete the niche
    const { error } = await supabase
      .from('niches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Niche deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

