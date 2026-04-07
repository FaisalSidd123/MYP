/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { uid: userId, error: authError } = await verifyAuth(request);
  if (authError) return authError;


  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { client_id, title, description, due_date, status } = body;
    const user_id = authUserId;

    if (!title || !status) {
      return NextResponse.json({ error: 'Missing required fields: title, status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id, client_id, title, description, due_date, status }])
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

// PUT - Update an existing task
export async function PUT(request: Request) {
  const { uid: authUserId, error: authError } = await verifyAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, client_id, title, description, due_date, status } = body;
    const user_id = authUserId;

    console.log('PUT request received:', { id, user_id, title, status }); // Debug log

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    if (!title || !status) {
      return NextResponse.json({ error: 'Title and status are required' }, { status: 400 });
    }

    // Prepare update data (only include fields that exist in the table)
    const updateData: any = {
      title,
      description,
      status,
    };

    // Only add client_id if provided
    if (client_id) updateData.client_id = client_id;

    // Only add due_date if provided
    if (due_date) updateData.due_date = due_date;

    // Only add updated_at if the column exists (or remove if not needed)
    // updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    console.log('Update result:', { data, error }); // Debug log

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a task
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
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}