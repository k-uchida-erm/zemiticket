import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET() {
  try {
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase configuration',
        details: { 
          supabaseUrl: !!supabaseUrl, 
          supabaseAnonKey: !!supabaseAnonKey 
        }
      }, { status: 500 });
    }

    // Supabaseクライアントの作成
    const supabase = await createSupabaseServerClient();
    
    // 基本的な接続テスト
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (testError) {
      return NextResponse.json({ 
        error: 'Supabase connection test failed',
        details: testError,
        message: testError.message
      }, { status: 500 });
    }

    // 各テーブルの存在確認
    const tableTests = await Promise.allSettled([
      supabase.from('users').select('count').limit(1),
      supabase.from('epics').select('count').limit(1),
      supabase.from('parent_tasks').select('count').limit(1),
      supabase.from('sub_tasks').select('count').limit(1),
      supabase.from('todos').select('count').limit(1)
    ]);

    const tableStatus = {
      users: tableTests[0].status === 'fulfilled' && !tableTests[0].value.error,
      epics: tableTests[1].status === 'fulfilled' && !tableTests[1].value.error,
      parent_tasks: tableTests[2].status === 'fulfilled' && !tableTests[2].value.error,
      sub_tasks: tableTests[3].status === 'fulfilled' && !tableTests[3].value.error,
      todos: tableTests[4].status === 'fulfilled' && !tableTests[4].value.error
    };

    // テーブル一覧の取得（PostgREST制限を回避）
    let tableList: string[] = [];
    try {
      // 直接SQLクエリでテーブル一覧を取得
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_table_list');
      
      if (tablesError) {
        // RPCが存在しない場合は、既知のテーブル名でテスト
        tableList = ['users', 'epics', 'parent_tasks', 'sub_tasks', 'todos', 'comments', 'review_comments', 'task_reviews'];
      } else {
        tableList = tablesData || [];
      }
    } catch (e) {
      // フォールバック: 既知のテーブル名を使用
      tableList = ['users', 'epics', 'parent_tasks', 'sub_tasks', 'todos', 'comments', 'review_comments', 'task_reviews'];
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      environment: {
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        hasAnonKey: !!supabaseAnonKey
      },
      tables: tableList,
      userCount: testData?.length || 0,
      tableStatus: tableStatus
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      error: 'Test connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
 