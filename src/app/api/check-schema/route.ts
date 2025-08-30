import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 各テーブルの構造を確認
    const results: Record<string, { columns: string[]; sample_data: Record<string, unknown> }> = {};
    
    // usersテーブル
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (!usersError && usersData && usersData.length > 0) {
      results.users = {
        columns: Object.keys(usersData[0]),
        sample_data: usersData[0]
      };
    }
    
    // epicsテーブル
    const { data: epicsData, error: epicsError } = await supabase
      .from('epics')
      .select('*')
      .limit(1);
    
    if (!epicsError && epicsData && epicsData.length > 0) {
      results.epics = {
        columns: Object.keys(epicsData[0]),
        sample_data: epicsData[0]
      };
    }
    
    // parent_tasksテーブル
    const { data: parentTasksData, error: parentTasksError } = await supabase
      .from('parent_tasks')
      .select('*')
      .limit(1);
    
    if (!parentTasksError && parentTasksData && parentTasksData.length > 0) {
      results.parent_tasks = {
        columns: Object.keys(parentTasksData[0]),
        sample_data: parentTasksData[0]
      };
    }
    
    // sub_tasksテーブル
    const { data: subTasksData, error: subTasksError } = await supabase
      .from('sub_tasks')
      .select('*')
      .limit(1);
    
    if (!subTasksError && subTasksData && subTasksData.length > 0) {
      results.sub_tasks = {
        columns: Object.keys(subTasksData[0]),
        sample_data: subTasksData[0]
      };
    }
    
    // todosテーブル
    const { data: todosData, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .limit(1);
    
    if (!todosError && todosData && todosData.length > 0) {
      results.todos = {
        columns: Object.keys(todosData[0]),
        sample_data: todosData[0]
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      schema: results
    });

  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json({ 
      error: 'Schema check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
 
 
 
 
 
 
 
 
 
 
 
 
 