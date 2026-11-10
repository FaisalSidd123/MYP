/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

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

  return NextResponse.json(data || []);
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

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        source: source?.trim() || 'Direct Inbound',
        status: status || 'new',
        niche_id: niche_id || null,
        niche_name: resolvedNicheName || null,
        deal_value: Number(deal_value) || 0,
        lead_score: Number(lead_score) || 50,
        pitch: pitch || [],
        pitch_notes: pitch_notes || null,
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
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            company: company?.trim() || null,
            source: source?.trim() || 'Direct Inbound',
            status: fallbackStatus,
            niche_id: niche_id || null,
            niche_name: resolvedNicheName || null,
            deal_value: Number(deal_value) || 0,
            lead_score: Number(lead_score) || 50,
            pitch: pitch || [],
            pitch_notes: pitch_notes || null,
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
            source: source?.trim() || 'Direct Inbound',
            status: mapFallbackStatus(status) || 'new',
            pitch: pitch || [],
            pitch_notes: pitch_notes || null,
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

    const { data, error } = await supabase
      .from('clients')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        source: source?.trim() || null,
        status,
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

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (pitch_notes !== undefined) {
      updates.pitch_notes = pitch_notes;
    } else if (scenario_notes !== undefined) {
      updates.pitch_notes = scenario_notes;
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
          return NextResponse.json({ ...retryData, status: updates.status });
        }
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
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
