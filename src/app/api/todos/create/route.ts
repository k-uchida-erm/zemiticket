import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
	try {
		// 環境変数の確認
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			return NextResponse.json(
				{ error: 'Supabase credentials not configured' },
				{ status: 500 }
			);
		}

		const { sub_task_id, title, estimate_hours } = await request.json();

		// バリデーション
		if (!sub_task_id || !title) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 現在のtodoの最大sort_orderを取得
		const { data: maxSortOrderResult, error: maxSortError } = await supabase
			.from('todos')
			.select('sort_order')
			.eq('sub_task_id', sub_task_id)
			.order('sort_order', { ascending: false })
			.limit(1);

		if (maxSortError) {
			console.error('Failed to fetch max sort order:', maxSortError);
			return NextResponse.json(
				{ error: 'Failed to determine sort order' },
				{ status: 500 }
			);
		}

		const nextSortOrder = maxSortOrderResult && maxSortOrderResult.length > 0 
			? (maxSortOrderResult[0].sort_order || 0) + 1 
			: 1;

		// 新規todoを作成
		const { data: newTodo, error: createError } = await supabase
			.from('todos')
			.insert({
				sub_task_id,
				title,
				done: false,
				in_progress: false,
				estimate_hours: (estimate_hours === null || estimate_hours === undefined) ? null : estimate_hours,
				progress_value: null,
				sort_order: nextSortOrder
			})
			.select()
			.single();

		if (createError) {
			console.error('Failed to create todo:', createError);
			return NextResponse.json(
				{ error: 'Failed to create todo' },
				{ status: 500 }
			);
		}

		return NextResponse.json(newTodo);

	} catch (error) {
		console.error('Error in /api/todos/create:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 
