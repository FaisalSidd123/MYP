/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

// GET - Retrieve all niches for the user with aggregated lead metrics
export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    // 1. Fetch niches for user
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (nichesError) {
      console.error('[/api/niches GET Error]:', nichesError.message);
      // Fallback: if table doesn't exist yet, return empty array gracefully
      return NextResponse.json([]);
    }

    // 2. Fetch clients to compute per-niche metrics
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, niche_id, niche_name, status, deal_value')
      .eq('user_id', userId);

    if (clientsError) {
      console.error('[/api/niches clients query Error]:', clientsError.message);
    }

    const clientList = clients || [];

    // Aggregate stats per niche
    const enrichedNiches = (niches || []).map((niche: any) => {
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

    const { data, error } = await supabase
      .from('niches')
      .insert([{
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || '',
        color: color || 'indigo',
        icon: icon || 'category',
        target_deal_size: Number(target_deal_size) || 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('[/api/niches POST Error]:', error.message);
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

