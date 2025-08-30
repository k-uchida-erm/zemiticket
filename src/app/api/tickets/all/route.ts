import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { transformTaskData } from '../../../../lib/utils/timeCalculations';

export async function GET(request: NextRequest) {
	try {
		// 環境変数の確認
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			console.error('Missing Supabase credentials');
			return NextResponse.json(
				{ error: 'Supabase credentials not configured' },
				{ status: 500 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 全チケットをエピックごとに取得
		const { data: parentTasks, error: parentError } = await supabase
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
			.order('is_active', { ascending: false }) // アクティブなチケットを先に表示
			.order('sort_order', { ascending: true })
			.order('priority', { ascending: false })
			.order('due_date', { ascending: true });

		if (parentError) {
			console.error('Failed to fetch parent tasks:', parentError);
			return NextResponse.json(
				{ error: 'Failed to fetch parent tasks' },
				{ status: 500 }
			);
		}

		if (!parentTasks || parentTasks.length === 0) {
			return NextResponse.json({ data: [] });
		}

		// エピックごとにグループ化
		const groupedByEpic = new Map<string, any[]>();
		
		parentTasks.forEach((parentTask) => {
			const epicName = parentTask.epics?.name || '未分類';
			if (!groupedByEpic.has(epicName)) {
				groupedByEpic.set(epicName, []);
			}
			
			// 共通関数でデータ変換（時間計算込み）
			const formattedParent = transformTaskData(parentTask);
			groupedByEpic.get(epicName)!.push(formattedParent);
		});

		// Mapを配列に変換
		const result = Array.from(groupedByEpic.entries()).map(([epic, list]) => ({
			epic,
			list
		}));

		return NextResponse.json({ data: result });

	} catch (error) {
		console.error('Error in /api/tickets/all:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 
 
 
 
 
 
 
 
 
 