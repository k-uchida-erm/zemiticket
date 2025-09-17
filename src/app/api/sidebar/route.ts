import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId') || '00000000-0000-0000-0000-000000000001';

    // ワークスペース情報を取得
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, name, description')
      .eq('id', workspaceId);

    if (workspacesError) {
      console.error('Workspaces error:', workspacesError);
    }

    // ワークスペースメンバー情報を取得
    const { data: workspaceMembers, error: membersError } = await supabase
      .from('workspace_members')
      .select(`
        user_id,
        role,
        users:user_id (
          id,
          name,
          email,
          grade
        )
      `)
      .eq('workspace_id', workspaceId);

    if (membersError) {
      console.error('Workspace members error:', membersError);
    }

    // 現在のユーザーID（未使用のためプレースホルダーに置換）
    const _currentUserId = workspaceMembers && workspaceMembers.length > 0
      ? workspaceMembers[0].users?.id || 'b4c82595-bdef-4724-abbe-d7636f06defc'
      : 'b4c82595-bdef-4724-abbe-d7636f06defc';

    // 研究テーマ情報を取得
    const { data: researchTopics, error: researchTopicsError } = await supabase
      .from('research_topics')
      .select('id, name, display_name, color')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (researchTopicsError) {
      console.error('Research topics error:', researchTopicsError);
    }

    // オーナー情報を取得
    const owner = workspaceMembers?.find((member: { role: string; users?: { id?: string; name?: string; email?: string } }) => member.role === 'owner')?.users || null;
    const ownerUser = owner ? {
      id: owner.id || '',
      name: owner.name || '',
      email: owner.email || ''
    } : null;

    // 現在のユーザー情報（最初のメンバーを現在のユーザーとする）
    const currentUser = workspaceMembers && workspaceMembers.length > 0
      ? {
          id: workspaceMembers[0].users?.id || 'b4c82595-bdef-4724-abbe-d7636f06defc',
          name: workspaceMembers[0].users?.name || '田中太郎',
          email: workspaceMembers[0].users?.email || 'tanaka@klab.example.com'
        }
      : {
          id: 'b4c82595-bdef-4724-abbe-d7636f06defc',
          name: '田中太郎',
          email: 'tanaka@klab.example.com'
        };

    // メンバー情報を学年ごとに整理
    const membersByGrade = workspaceMembers?.reduce((acc: Record<string, Array<{id: string, name: string, email: string, role: string, grade: string}>>, member: { user_id: string; role: string; users?: { id?: string; name?: string; email?: string; grade?: string } }) => {
      const grade = member.users?.grade || 'B3';
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push({
        id: member.users?.id || member.user_id,
        name: member.users?.name || 'Unknown',
        email: member.users?.email || 'unknown@example.com',
        role: member.role,
        grade: grade
      });
      return acc;
    }, {} as Record<string, Array<{id: string, name: string, email: string, role: string, grade: string}>>) || {};

    // 学年順でソート（B3, B4, M1, M2, D1, D2, D3）
    const gradeOrder = ['B3', 'B4', 'M1', 'M2', 'D1', 'D2', 'D3'];
    const members = gradeOrder
      .filter(grade => membersByGrade[grade])
      .map(grade => ({
        grade: grade,
        members: membersByGrade[grade]
      }));

    return NextResponse.json({
      workspaces: workspaces || [],
      researchTopics: researchTopics || [],
      members: members,
      currentUser: currentUser,
      owner: ownerUser
    });

  } catch (error) {
    console.error('Error in sidebar API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
