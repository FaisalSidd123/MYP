/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

// Helper to check valid UUID strings
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

// Helper to map expanded statuses to legacy statuses if the DB still has the old 'clients_status_check' constraint
function mapFallbackStatus(status?: string): string {
  const clean = status?.toLowerCase().trim();
  switch (clean) {
    case 'won':
      return 'approved';
    case 'lost':
      return 'inactive';
    case 'demo_required':
    case 'demo_sent':
    case 'follow_up':
    case 'postponed':
      return 'negotiation';
    default:
      return clean || 'new';
  }
}

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const nicheId = url.searchParams.get('niche_id');
  const nicheName = url.searchParams.get('niche');
  const orgId = url.searchParams.get('org_id') || request.headers.get('x-org-id');
  const orgScope = await resolveOrgScope(userId, orgId);

  let query = supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (nicheId && nicheId !== 'all') {
    query = query.eq('niche_id', nicheId);
  } else if (nicheName && nicheName !== 'all') {
    query = query.eq('niche_name', nicheName);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[/api/contacts GET Error]:', error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // In-memory filter for 100% precision across both DB and Virtual modes
  let filtered = data || [];
  if (orgScope.orgId) {
    if (orgScope.isPersonal) {
      filtered = filtered.filter((c: any) => {
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
      // Office Sales / Primary
      filtered = filtered.filter((c: any) => {
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

  // Strip internal virtual tag from pitch_notes before returning to UI
  const sanitized = filtered.map((c: any) => {
    if (c.pitch_notes && typeof c.pitch_notes === 'string') {
      const cleaned = c.pitch_notes.replace(/\[org:personal-brand\]/g, '').trim();
      return { ...c, pitch_notes: cleaned || null };
    }
    return c;
  });

  return NextResponse.json(sanitized);
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      niche_id,
      niche_name,
      deal_value,
      lead_score,
      pitch,
      pitch_notes,
      avatar_url,
      created_at
    } = body;
    const user_id = authUserId;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    // Resolve niche_name if niche_id provided
    let resolvedNicheName = niche_name;
    if (niche_id && !resolvedNicheName) {
      const { data: nicheData } = await supabase
        .from('niches')
        .select('name')
        .eq('id', niche_id)
        .single();
      if (nicheData) {
        resolvedNicheName = nicheData.name;
      }
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(user_id, rawOrgId);
    const org_id = (rawOrgId && isValidUuid(rawOrgId)) ? rawOrgId : null;

    let finalPitchNotes = pitch_notes || null;
    const finalSource = source?.trim() || (orgScope.isPersonal ? 'Personal Brand' : 'Direct Inbound');

    if (orgScope.isPersonal) {
      if (!finalPitchNotes?.includes('[org:personal-brand]')) {
        finalPitchNotes = finalPitchNotes ? `${finalPitchNotes} [org:personal-brand]` : '[org:personal-brand]';
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id,
        org_id: org_id || null,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        source: finalSource,
        status: status || 'new',
        niche_id: niche_id || null,
        niche_name: resolvedNicheName || null,
        deal_value: Number(deal_value) || 0,
        lead_score: Number(lead_score) || 50,
        pitch: pitch || [],
        pitch_notes: finalPitchNotes,
        avatar_url: avatar_url || null,
        created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('[/api/contacts POST Error]:', error.message);

      // Handle PostgreSQL check constraint clients_status_check
      if (error.code === '23514' || error.message?.includes('clients_status_check')) {
        const fallbackStatus = mapFallbackStatus(status);
        const { data: retryData, error: retryError } = await supabase
          .from('clients')
          .insert([{
            user_id,
            org_id: org_id || null,
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            company: company?.trim() || null,
            source: finalSource,
            status: fallbackStatus,
            niche_id: niche_id || null,
            niche_name: resolvedNicheName || null,
            deal_value: Number(deal_value) || 0,
            lead_score: Number(lead_score) || 50,
            pitch: pitch || [],
            pitch_notes: finalPitchNotes,
            avatar_url: avatar_url || null,
            created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
          }])
          .select()
          .single();

        if (!retryError && retryData) {
          return NextResponse.json({ ...retryData, status: status || 'new' }, { status: 201 });
        }
      }

      // Fallback: If new migration columns are not yet added to 'clients' in Supabase, insert core fields
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('clients')
          .insert([{
            user_id,
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            company: company?.trim() || null,
            source: finalSource,
            status: mapFallbackStatus(status) || 'new',
            pitch: pitch || [],
            pitch_notes: finalPitchNotes,
            avatar_url: avatar_url || null
          }])
          .select()
          .single();

        if (!fallbackError && fallbackData) {
          return NextResponse.json({ ...fallbackData, status: status || 'new' }, { status: 201 });
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update an existing contact
export async function PUT(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      company,
      source,
      status,
      niche_id,
      niche_name,
      deal_value,
      lead_score,
      pitch,
      pitch_notes,
      avatar_url,
      created_at
    } = body;
    const user_id = authUserId;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Resolve niche_name if niche_id provided
    let resolvedNicheName = niche_name;
    if (niche_id && !resolvedNicheName) {
      const { data: nicheData } = await supabase
        .from('niches')
        .select('name')
        .eq('id', niche_id)
        .single();
      if (nicheData) {
        resolvedNicheName = nicheData.name;
      }
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(authUserId, rawOrgId);
    let finalNotes = pitch_notes ?? body.scenario_notes ?? null;
    if (orgScope.isPersonal && finalNotes !== null && !finalNotes.includes('[org:personal-brand]')) {
      finalNotes = finalNotes ? `${finalNotes} [org:personal-brand]` : '[org:personal-brand]';
    }

    const { data, error } = await supabase
      .from('clients')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        source: source?.trim() || (orgScope.isPersonal ? 'Personal Brand' : null),
        status,
        niche_id: niche_id || null,
        niche_name: resolvedNicheName || null,
        deal_value: Number(deal_value) || 0,
        lead_score: Number(lead_score) || 50,
        pitch: pitch || [],
        pitch_notes: finalNotes,
        avatar_url,
        ...(created_at ? { created_at: new Date(created_at).toISOString() } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('[/api/contacts PUT Error]:', error.message);

      // Handle PostgreSQL check constraint clients_status_check
      if (error.code === '23514' || error.message?.includes('clients_status_check')) {
        const fallbackStatus = mapFallbackStatus(status);
        const { data: retryData, error: retryError } = await supabase
          .from('clients')
          .update({
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            company: company?.trim() || null,
            source: source?.trim() || null,
            status: fallbackStatus,
            niche_id: niche_id || null,
            niche_name: resolvedNicheName || null,
            deal_value: Number(deal_value) || 0,
            lead_score: Number(lead_score) || 50,
            pitch: pitch || [],
            pitch_notes: pitch_notes ?? body.scenario_notes ?? null,
            avatar_url,
            ...(created_at ? { created_at: new Date(created_at).toISOString() } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user_id)
          .select()
          .single();

        if (!retryError && retryData) {
          return NextResponse.json({ ...retryData, status: status });
        }
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH - Partially update lead status, scenario notes, or quick fields
export async function PATCH(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, pitch_notes, scenario_notes, deal_value, lead_score } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing contact id' }, { status: 400 });
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(authUserId, rawOrgId);

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (pitch_notes !== undefined || scenario_notes !== undefined) {
      let notes = (pitch_notes !== undefined ? pitch_notes : scenario_notes) ?? '';
      if (orgScope.isPersonal && !notes.includes('[org:personal-brand]')) {
        notes = notes ? `${notes} [org:personal-brand]` : '[org:personal-brand]';
      }
      updates.pitch_notes = notes || null;
    }
    if (deal_value !== undefined) updates.deal_value = Number(deal_value) || 0;
    if (lead_score !== undefined) updates.lead_score = Number(lead_score) || 50;

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', authUserId)
      .select()
      .single();

    if (error) {
      console.error('[/api/contacts PATCH Error]:', error.message);

      // Handle PostgreSQL check constraint clients_status_check
      if (error.code === '23514' || error.message?.includes('clients_status_check')) {
        const fallbackStatus = mapFallbackStatus(updates.status);
        const fallbackUpdates = { ...updates, status: fallbackStatus };
        const { data: retryData, error: retryError } = await supabase
          .from('clients')
          .update(fallbackUpdates)
          .eq('id', id)
          .eq('user_id', authUserId)
          .select()
          .single();

        if (!retryError && retryData) {
          const cleanNotes = retryData.pitch_notes ? retryData.pitch_notes.replace(/\[org:personal-brand\]/g, '').trim() : null;
          return NextResponse.json({ ...retryData, status: updates.status, pitch_notes: cleanNotes });
        }
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cleanNotes = data?.pitch_notes ? data.pitch_notes.replace(/\[org:personal-brand\]/g, '').trim() : null;
    return NextResponse.json({ ...data, pitch_notes: cleanNotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a contact
export async function DELETE(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing contact id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', authUserId);

  if (error) {
    console.error('[/api/contacts DELETE Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Contact deleted successfully' });
}
