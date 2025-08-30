import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
	try {
		// 環境変数の確認
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			console.error('Missing Supabase credentials');
			return NextResponse.json(
				{ error: 'Supabase credentials not configured' },
				{ status: 500 }
			);
		}

		const { parent_task_id, title, due_date } = await request.json();

		// バリデーション（user_idはサーバーサイドで自動取得するため必須ではない）
		if (!parent_task_id || !title) {
			console.error('Missing required fields:', { parent_task_id, title });
			return NextResponse.json(
				{ error: 'Missing required fields: parent_task_id and title are required' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 有効なユーザーIDを取得（最初のユーザーを使用）
		const { data: users, error: userError } = await supabase
			.from('users')
			.select('id')
			.limit(1);

		if (userError || !users || users.length === 0) {
			console.error('No users found in database');
			return NextResponse.json(
				{ error: 'No users found in database' },
				{ status: 500 }
			);
		}

		const validUserId = users[0].id;

		// 現在のサブタスクの最大sort_orderを取得
		const { data: maxSortOrderResult, error: maxSortError } = await supabase
			.from('sub_tasks')
			.select('sort_order')
			.eq('parent_task_id', parent_task_id)
			.order('sort_order', { ascending: false })
			.limit(1);

		if (maxSortError) {
			console.error('Failed to fetch max sort order');
			return NextResponse.json(
				{ error: 'Failed to determine sort order' },
				{ status: 500 }
			);
		}

		const nextSortOrder = maxSortOrderResult && maxSortOrderResult.length > 0 
			? (maxSortOrderResult[0].sort_order || 0) + 1 
			: 1;

		// slugを自動生成（タイトルベース）
		const generateSlug = (title: string) => {
			return title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim()
				+ '-' + Date.now();
		};

		const slug = generateSlug(title);

		// 新規サブチケットを作成
		const { data: newSubTask, error: createError } = await supabase
			.from('sub_tasks')
			.insert({
				parent_task_id,
				title,
				slug,
				due_date: due_date || null,
				user_id: validUserId,
				done: false,
				status: 'todo',
				priority: 'medium',
				estimate_hours: null,
				actual_hours: null,
				comments_count: 0,
				sort_order: nextSortOrder
			})
			.select()
			.single();

		if (createError) {
			console.error('Supabase insert error:', createError);
			return NextResponse.json(
				{ error: `Database error: ${createError.message}` },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: newSubTask });

	} catch (error) {
		console.error('Unexpected error in /api/sub-tasks/create:', error);
		return NextResponse.json(
			{ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
			{ status: 500 }
		);
	}
} 
 
 
 
 
 
 
 
 
 
 
 
 
 