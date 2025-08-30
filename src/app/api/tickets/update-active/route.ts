import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function PUT(request: NextRequest) {
	try {
		const { ticketId, isActive } = await request.json();

		if (typeof ticketId !== 'string' || typeof isActive !== 'boolean') {
			return NextResponse.json(
				{ error: 'Invalid request data' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		const { error } = await supabase
			.from('parent_tasks')
			.update({ is_active: isActive })
			.eq('id', ticketId);

		if (error) {
			console.error('Failed to update ticket active status:', error);
			return NextResponse.json(
				{ error: 'Failed to update ticket active status' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });

	} catch (error) {
		console.error('Error in /api/tickets/update-active:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 