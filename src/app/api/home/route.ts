import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { transformTaskData } from '../../../lib/utils/timeCalculations';

export async function GET(request: NextRequest) {
  try {
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Missing Supabase configuration',
        details: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
      }, { status: 500 });
    }

    const supabase = await createSupabaseServerClient();

    // 1. アクティブチケットボード用データ（親タスクと子タスク）
    const { data: activeGroups, error: activeGroupsError } = await supabase
      .from('parent_tasks')
      .select(`
        *,
        users!fk_parent_tasks_user_id(name),
        epics!fk_parent_tasks_epic_id(name),
        sub_tasks(
          *,
          users(name),
          todos(*)
        )
      `)
      .eq('is_active', true) // is_active = trueのチケットのみ
      .order('sort_order', { ascending: true })
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (activeGroupsError) {
      console.error('Active groups error:', activeGroupsError);
      return NextResponse.json({ error: 'Failed to fetch active groups' }, { status: 500 });
    }

    // 2. レビュー中チケット用データ
    const { data: submittingTickets, error: submittingTicketsError } = await supabase
      .from('parent_tasks')
      .select(`
        *,
        users!fk_parent_tasks_user_id(name),
        epics!fk_parent_tasks_epic_id(name),
        sub_tasks(
          *,
          users(name),
          todos(*)
        )
      `)
      .eq('status', 'review')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false });

    if (submittingTicketsError) {
      console.error('Submitting tickets error:', submittingTicketsError);
      return NextResponse.json({ error: 'Failed to fetch submitting tickets' }, { status: 500 });
    }

    // 3. 他ユーザーのアクティブチケット
    const { data: othersActiveParents, error: othersActiveParentsError } = await supabase
      .from('parent_tasks')
      .select(`
        *,
        users!fk_parent_tasks_user_id(name),
        epics!fk_parent_tasks_epic_id(name),
        sub_tasks(
          *,
          users(name),
          todos(*)
        )
      `)
      .in('status', ['todo', 'in_progress'])
      .not('user_id', 'is', null)
      .order('sort_order', { ascending: true })
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (othersActiveParentsError) {
      console.error('Others active parents error:', othersActiveParentsError);
      return NextResponse.json({ error: 'Failed to fetch others active parents' }, { status: 500 });
    }

    // 共通関数でデータ変換（時間計算込み）
    const transformedActiveGroups = activeGroups?.map((group: any) => transformTaskData(group)) || [];

    // 提出中のチケットは UI が (ParentTask & { children?: SubTask[] })[] を期待するため、
    // transformTaskData の結果から { ...parent, children } に正規化する
    const transformedSubmittingTickets = submittingTickets?.map((ticket: any) => {
      const t = transformTaskData(ticket);
      return { ...t.parent, children: t.children };
    }) || [];

    // Others 用も同様にチケット配列を { ...parent, children } 形式で返す
    // （ユーザー単位でグルーピングする必要があれば、ここで groupBy 可能）
    const transformedOthersActive = othersActiveParents?.map((ticket: any) => {
      const t = transformTaskData(ticket);
      return {
        user: t.parent.user,
        tickets: [{ ...t.parent, children: t.children }]
      };
    }) || [];

    return NextResponse.json({
      activeGroups: transformedActiveGroups,
      submittingTickets: transformedSubmittingTickets,
      othersGrouped: transformedOthersActive
    });

  } catch (error) {
    console.error('Error in /api/home:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 
 
 
 
 
 
 
 
 