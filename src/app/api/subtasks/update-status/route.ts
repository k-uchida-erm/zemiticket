import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();

		const { subtaskId, status } = body;

		// subtaskIdの型チェックを緩和（string, number, UUIDすべて受け入れ）
		// statusの値チェックも緩和（in_progressも受け入れ、内部的にactiveに変換）
		if (!subtaskId || !['todo', 'active', 'completed', 'in_progress'].includes(status)) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: { subtaskId, status, subtaskIdType: typeof subtaskId } },
				{ status: 400 }
			);
		}

		// in_progressをactiveに変換
		const normalizedStatus = status === 'in_progress' ? 'active' : status;

		const supabase = await createSupabaseServerClient();

		const { data, error } = await supabase
			.from('sub_tasks')
			.update({ status: normalizedStatus })
			.eq('id', subtaskId)
			.select();

		if (error) {
			return NextResponse.json(
				{ error: 'Failed to update subtask status', details: error },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data });

	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error', details: error },
			{ status: 500 }
		);
	}
} 