import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { transformTaskData } from '../../../../lib/utils/timeCalculations';
import type { ParentTask, SubTask } from '../../../../types';

// Supabaseから返されるデータの型定義
interface SupabaseParentTask {
	id: string;
	title: string;
	user: string;
	description?: string;
	slug?: string;
	status?: string;
	priority?: string;
	epics?: { name?: string };
	sub_tasks?: Array<{
		id: string;
		title: string;
		user: string;
		description?: string;
		status?: string;
		todos?: Array<{
			id: string;
			title: string;
			done?: boolean;
			estimate_hours?: number;
			sort_order?: number;
		}>;
		sort_order?: number;
		[key: string]: unknown;
	}>;
	[key: string]: unknown; // その他のフィールド
}

export async function GET() {
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
		const groupedByEpic = new Map<string, Array<{ parent: ParentTask; children: SubTask[] }>>();
		
		parentTasks.forEach((parentTask: SupabaseParentTask) => {
			const epicName = parentTask.epics?.name || '未分類';
			if (!groupedByEpic.has(epicName)) {
				groupedByEpic.set(epicName, []);
			}
			
			// 共通関数でデータ変換（時間計算込み）
			const formattedParent = transformTaskData(parentTask as ParentTask);
			
			// チケットページ用の形式に変換
			const ticketPageFormat = {
				parent: formattedParent.parent,
				children: formattedParent.children
			};
			
			groupedByEpic.get(epicName)!.push(ticketPageFormat);
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
 
 
 
 
 
 
 
 
 