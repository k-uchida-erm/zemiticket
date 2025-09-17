import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { UserWorkspace } from '../../../types/workspace';

export async function GET(request: Request) {
  try {
    console.log('user-workspaces API called');

    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const _supabase = await createSupabaseServerClient();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    console.log('userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 開発用: データベースクエリをスキップしてフォールバックデータを返す
    console.log('Using fallback data for development');
    const fallbackWorkspace: UserWorkspace = {
      workspace: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'K_lab',
        description: 'K_lab研究室',
        owner_id: 'b4c82595-bdef-4724-abbe-d7636f06defc'
      },
      member: {
        user_id: userId,
        workspace_id: '00000000-0000-0000-0000-000000000001',
        role: 'member',
        joined_at: new Date().toISOString()
      }
    };

    return NextResponse.json({
      workspaces: [fallbackWorkspace]
    });

    // 以下は将来的にデータベースが準備できた時に使用
    /*
    // ユーザーが所属するワークスペースメンバー情報を取得
    const { data: workspaceMembers, error: membersError } = await supabase
      .from('workspace_members')
      .select('user_id, workspace_id, role, joined_at')
      .eq('user_id', userId);

    if (membersError) {
      console.error('Workspace members error:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch workspace members', details: membersError },
        { status: 500 }
      );
    }

    console.log('workspaceMembers:', workspaceMembers);

    // 開発用: データベースにデータがない場合のフォールバック
    if (!workspaceMembers || workspaceMembers.length === 0) {
      // デフォルトのK_labワークスペースを返す（開発用）
      const fallbackWorkspace: UserWorkspace = {
        workspace: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'K_lab',
          description: 'K_lab研究室',
          owner_id: 'b4c82595-bdef-4724-abbe-d7636f06defc'
        },
        member: {
          user_id: userId,
          workspace_id: '00000000-0000-0000-0000-000000000001',
          role: 'member',
          joined_at: new Date().toISOString()
        }
      };

      return NextResponse.json({
        workspaces: [fallbackWorkspace]
      });
    }
    */


  } catch (error) {
    console.error('Error in /api/user-workspaces:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
