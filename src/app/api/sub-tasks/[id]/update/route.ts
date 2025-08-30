import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

interface RouteParams {
	params: Promise<{ id: string }>;
}

interface UpdateData {
	title?: string;
	due_date?: string;
	user_id?: string;
	done?: boolean;
	status?: string;
	priority?: string;
	estimate_hours?: number;
	sort_order?: number;
}

export async function PUT(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			return NextResponse.json(
				{ error: 'Supabase credentials not configured' },
				{ status: 500 }
			);
		}

		const resolvedParams = await params;
		const { id } = resolvedParams;
		const { title, due_date, user_id, done, status, priority, estimate_hours, sort_order } = await request.json();

		if (!id) {
			return NextResponse.json(
				{ error: 'Sub task ID is required' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 更新するフィールドを構築
		const updateData: UpdateData = {};
		if (title !== undefined) updateData.title = title;
		if (due_date !== undefined) updateData.due_date = due_date;
		if (user_id !== undefined) updateData.user_id = user_id;
		if (done !== undefined) updateData.done = done;
		if (status !== undefined) updateData.status = status;
		if (priority !== undefined) updateData.priority = priority;
		if (estimate_hours !== undefined) updateData.estimate_hours = estimate_hours;
		if (sort_order !== undefined) updateData.sort_order = sort_order;

		const { data: updatedSubTask, error: updateError } = await supabase
			.from('sub_tasks')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Failed to update sub task:', updateError);
			return NextResponse.json(
				{ error: 'Failed to update sub task' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			success: true, 
			data: updatedSubTask 
		});

	} catch (error) {
		console.error('Error in /api/sub-tasks/[id]/update:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 
 