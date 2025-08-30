import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

interface UpdateData {
	title?: string;
	done?: boolean;
	in_progress?: boolean;
	estimate_hours?: number;
	progress_value?: number;
	sort_order?: number;
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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
		const { title, done, in_progress, estimate_hours, progress_value, sort_order } = await request.json();

		if (!id) {
			return NextResponse.json(
				{ error: 'Todo ID is required' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 更新するフィールドを構築
		const updateData: UpdateData = {};
		if (title !== undefined) updateData.title = title;
		if (done !== undefined) updateData.done = done;
		if (in_progress !== undefined) updateData.in_progress = in_progress;
		if (estimate_hours !== undefined) updateData.estimate_hours = estimate_hours;
		if (progress_value !== undefined) updateData.progress_value = progress_value;
		if (sort_order !== undefined) updateData.sort_order = sort_order;

		const { data: updatedTodo, error: updateError } = await supabase
			.from('todos')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Failed to update todo:', updateError);
			return NextResponse.json(
				{ error: 'Failed to update todo' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			success: true, 
			data: updatedTodo 
		});

	} catch (error) {
		console.error('Error in /api/todos/[id]/update:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}  
 