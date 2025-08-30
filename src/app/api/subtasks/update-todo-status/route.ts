import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function PUT(request: NextRequest) {
	try {
		const { subtaskId, todoId, done } = await request.json();

		if (!subtaskId || !todoId || typeof done !== 'boolean') {
			return NextResponse.json(
				{ error: 'Invalid request data' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 1. todoの完了状態を更新
		const { error: todoUpdateError } = await supabase
			.from('todos')
			.update({ done })
			.eq('id', todoId);

		if (todoUpdateError) {
			return NextResponse.json(
				{ error: 'Failed to update todo status' },
				{ status: 500 }
			);
		}

		// 2. サブチケットの全todosの完了状態をチェック
		const { data: todos, error: todosFetchError } = await supabase
			.from('todos')
			.select('done')
			.eq('sub_task_id', subtaskId);

		if (todosFetchError) {
			return NextResponse.json(
				{ error: 'Failed to fetch todos' },
				{ status: 500 }
			);
		}

		// 3. 必要に応じてサブチケットのstatusを自動更新
		// ただし、手動でのドラッグ&ドロップによる変更は妨げない
		if (todos && todos.length > 0) {
			const completedCount = todos.filter((todo: { done: boolean }) => todo.done).length;
			const totalCount = todos.length;
			
			let newStatus: 'todo' | 'active' | 'completed';
			
			if (completedCount === 0) {
				newStatus = 'todo';
			} else if (completedCount === totalCount) {
				newStatus = 'completed';
			} else {
				newStatus = 'active';
			}

			// サブチケットのstatusを更新（自動更新）
			// 手動更新との競合を避けるため、必要最小限の更新のみ
			await supabase
				.from('sub_tasks')
				.update({ status: newStatus })
				.eq('id', subtaskId);
		}

		return NextResponse.json({ success: true });

	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 