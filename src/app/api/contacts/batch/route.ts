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

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { leads, niche_id: defaultNicheId, niche_name: defaultNicheName } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: "leads" must be a non-empty array' },
        { status: 400 }
      );
    }

    // Resolve default niche name if only ID provided
    let resolvedDefaultNicheName = defaultNicheName;
    if (defaultNicheId && !resolvedDefaultNicheName) {
      const { data: nicheData } = await supabase
        .from('niches')
        .select('name')
        .eq('id', defaultNicheId)
        .single();
      if (nicheData) {
        resolvedDefaultNicheName = nicheData.name;
      }
    }

    const rawOrgId = body.org_id || request.headers.get('x-org-id');
    const orgScope = await resolveOrgScope(authUserId, rawOrgId);
    const orgId = (rawOrgId && isValidUuid(rawOrgId)) ? rawOrgId : null;

    // Prepare rows for bulk insert
    const rows = leads.map((lead: any, idx: number) => {
      const name = lead.name?.trim() || `Lead #${idx + 1}`;
      const nicheId = lead.niche_id || defaultNicheId || null;
      const nicheName = lead.niche_name || (lead.niche_id ? null : resolvedDefaultNicheName) || null;

      let finalPitchNotes = lead.pitch_notes?.trim() || null;
      const defaultSource = orgScope.isPersonal ? 'Personal Brand' : 'Bulk Raw Import';
      const finalSource = lead.source?.trim() || defaultSource;

      if (orgScope.isPersonal) {
        if (!finalPitchNotes?.includes('[org:personal-brand]')) {
          finalPitchNotes = finalPitchNotes ? `${finalPitchNotes} [org:personal-brand]` : '[org:personal-brand]';
        }
      }

      return {
        user_id: authUserId,
        org_id: orgId || null,
        name,
        email: lead.email?.trim() || null,
        phone: lead.phone?.trim() || null,
        company: lead.company?.trim() || null,
        source: finalSource,
        status: lead.status || 'new',
        niche_id: nicheId,
        niche_name: nicheName,
        deal_value: Number(lead.deal_value) || 0,
        lead_score: Number(lead.lead_score) || 50,
        pitch: Array.isArray(lead.pitch) ? lead.pitch : [],
        pitch_notes: finalPitchNotes,
        avatar_url: lead.avatar_url || null,
        created_at: lead.created_at ? new Date(lead.created_at).toISOString() : new Date().toISOString(),
      };
    });

    // Attempt primary batch insert
    const { data, error } = await supabase
      .from('clients')
      .insert(rows)
      .select();

    if (error) {
      console.error('[/api/contacts/batch Primary Insert Error]:', error.message);

      // Handle PostgreSQL check constraint clients_status_check
      if (error.code === '23514' || error.message?.includes('clients_status_check')) {
        const safeRows = rows.map((r: any) => ({ ...r, status: mapFallbackStatus(r.status) }));
        const { data: retryData, error: retryError } = await supabase
          .from('clients')
          .insert(safeRows)
          .select();

        if (!retryError && retryData) {
          return NextResponse.json({
            success: true,
            count: retryData.length,
            contacts: retryData,
          }, { status: 201 });
        }
      }

      // Fallback: If new migration columns (niche_id, niche_name, lead_score, etc.) are missing in Supabase schema
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        const fallbackRows = rows.map((r: any) => ({
          user_id: r.user_id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          company: r.company,
          source: r.source,
          status: r.status,
          pitch: r.pitch,
          pitch_notes: r.pitch_notes,
          avatar_url: r.avatar_url,
        }));

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('clients')
          .insert(fallbackRows)
          .select();

        if (fallbackError) {
          console.error('[/api/contacts/batch Fallback Error]:', fallbackError.message);
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          count: fallbackData?.length || 0,
          contacts: fallbackData || [],
        }, { status: 201 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      contacts: data || [],
    }, { status: 201 });
  } catch (err: any) {
    console.error('[/api/contacts/batch Exception]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

