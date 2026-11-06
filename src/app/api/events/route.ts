/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;


  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[/api/events GET Error]:', error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { client_id, title, start_time, end_time, description, type, status } = body;
    const user_id = authUserId;

    if (!title || !start_time) {
      return NextResponse.json({ error: 'Missing required fields: title, start_time' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert([{
        user_id,
        client_id,
        title,
        start_time,
        end_time,
        description,
        type: type || 'follow_up',
        status: status || 'pending'
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

// PUT - Update an existing event
export async function PUT(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, client_id, title, start_time, end_time, description, type, status } = body;
    const user_id = authUserId;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    if (!title || !start_time) {
      return NextResponse.json({ error: 'Title and start_time are required' }, { status: 400 });
    }

    const updateData: any = {
      title,
      start_time,
      description,
      type,
      status,
    };

    if (client_id) updateData.client_id = client_id;
    if (end_time) updateData.end_time = end_time;

    const { data, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove an event
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
      .from('schedules')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}