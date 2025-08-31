import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { transformTaskData } from '../../../../lib/utils/timeCalculations';
import type { ParentTask, SubTask } from '../../../../types';

// SupabaseデータをParentTask型に変換する関数
function convertToParentTask(supabaseTask: SupabaseParentTask): ParentTask {
	return {
		id: supabaseTask.id,
		title: supabaseTask.title,
		user: supabaseTask.user,
		description: supabaseTask.description,
		slug: supabaseTask.slug,
		status:
			(supabaseTask.status as 'todo' | 'in_progress' | 'review' | 'done') ||
			'todo',
		priority:
			(supabaseTask.priority as 'low' | 'medium' | 'high' | 'urgent') ||
			'medium',
		estimateHours: supabaseTask.estimate_hours,
		is_active: supabaseTask.is_active,
		sub_tasks:
			supabaseTask.sub_tasks?.map(subTask => ({
				id: subTask.id,
				title: subTask.title,
				user: subTask.user,
				description: subTask.description,
				status:
					(subTask.status as 'todo' | 'in_progress' | 'review' | 'done') ||
					'todo',
				estimateHours: subTask.estimate_hours,
				todos:
					subTask.todos?.map(todo => ({
						id: todo.id,
						title: todo.title,
						done: todo.done,
						estimateHours: todo.estimate_hours,
						sort_order: todo.sort_order,
					})) || [],
			})) || [],
	};
}

// Supabaseから返されるデータの型定義
interface SupabaseParentTask {
	id: string;
	title: string;
	user: string;
	description?: string;
	slug?: string;
	status?: string;
	priority?: string;
	estimate_hours?: number;
	is_active?: boolean;
	epics?: { name?: string };
	sub_tasks?: Array<{
		id: string;
		title: string;
		user: string;
		description?: string;
		status?: string;
		estimate_hours?: number;
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
		if (
			!process.env.NEXT_PUBLIC_SUPABASE_URL ||
			!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		) {
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
			.select(
				`
				*,
				users!fk_parent_tasks_user_id(name),
				epics!fk_parent_tasks_epic_id(name),
				sub_tasks(
					*,
					users(name),
					todos(*)
				).order('sort_order', { ascending: true })
			`
			)
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
		const groupedByEpic = new Map<
			string,
			Array<{ parent: ParentTask; children: SubTask[] }>
		>();

		parentTasks.forEach((parentTask: SupabaseParentTask) => {
			const epicName = parentTask.epics?.name || '未分類';
			if (!groupedByEpic.has(epicName)) {
				groupedByEpic.set(epicName, []);
			}

			// SupabaseデータをParentTask型に変換
			const convertedParent = convertToParentTask(parentTask);
			// 共通関数でデータ変換（時間計算込み）
			const formattedParent = transformTaskData(convertedParent);

			// チケットページ用の形式に変換
			const ticketPageFormat = {
				parent: formattedParent.parent,
				children: formattedParent.children,
			};

			groupedByEpic.get(epicName)!.push(ticketPageFormat);
		});

		// Mapを配列に変換
		const result = Array.from(groupedByEpic.entries()).map(([epic, list]) => ({
			epic,
			list,
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
