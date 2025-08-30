import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

interface RouteParams {
	params: Promise<{ id: string }>;
}

interface UpdateData {
	title?: string;
	description?: string;
	due_date?: string;
	status?: string;
	priority?: string;
	estimate_hours?: number;
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
		const { title, description, due_date, status, priority, estimate_hours } = await request.json();

		if (!id) {
			return NextResponse.json(
				{ error: 'Parent task ID is required' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// 更新するフィールドを構築
		const updateData: UpdateData = {};
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (due_date !== undefined) updateData.due_date = due_date;
		if (status !== undefined) updateData.status = status;
		if (priority !== undefined) updateData.priority = priority;
		if (estimate_hours !== undefined) updateData.estimate_hours = estimate_hours;

		const { data: updatedParentTask, error: updateError } = await supabase
			.from('parent_tasks')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Failed to update parent task:', updateError);
			return NextResponse.json(
				{ error: 'Failed to update parent task' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			success: true, 
			data: updatedParentTask 
		});

	} catch (error) {
		console.error('Error in /api/parent-tasks/[id]/update:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 
 