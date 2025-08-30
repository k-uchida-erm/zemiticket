import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const { todoId, done } = await request.json();
    
    if (typeof todoId !== 'string' || typeof done !== 'boolean') {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: { todoId, done }
      }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // todoの完了状態を更新
    const { data, error } = await supabase
      .from('todos')
      .update({ 
        done: done,
        updated_at: new Date().toISOString()
      })
      .eq('id', todoId)
      .select('*, sub_tasks!inner(parent_task_id)')
      .single();

    if (error) {
      console.error('Todo update error:', error);
      return NextResponse.json({ 
        error: 'Failed to update todo',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Todo updated successfully',
      todo: data
    });

  } catch (error) {
    console.error('Todo update API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
 
 
 
 
 
 
 
 
 
 
 
 
 