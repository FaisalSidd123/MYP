/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;


  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('[/api/contacts GET Error]:', error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, email, phone, company, source, status, pitch, pitch_notes, avatar_url } = body;
    const user_id = authUserId;

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id,
        name,
        email,
        phone,
        company,
        source,
        status: status || 'new',
        pitch: pitch || [],
        pitch_notes,
        avatar_url
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update an existing contact
export async function PUT(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name, email, phone, company, source, status, pitch, pitch_notes, avatar_url } = body;
    const user_id = authUserId;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
        company,
        source,
        status,
        pitch: pitch || [],
        pitch_notes,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user_id) // Ensure user can only update their own contacts
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a contact
export async function DELETE(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only delete their own contacts
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contact deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}