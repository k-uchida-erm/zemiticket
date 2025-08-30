import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';

export async function DELETE(
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

		if (!id) {
			return NextResponse.json(
				{ error: 'Todo ID is required' },
				{ status: 400 }
			);
		}

		const supabase = await createSupabaseServerClient();

		// todoを削除
		const { error: deleteError } = await supabase
			.from('todos')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Failed to delete todo:', deleteError);
			return NextResponse.json(
				{ error: 'Failed to delete todo' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ 
			success: true, 
			message: 'Todo deleted successfully' 
		});

	} catch (error) {
		console.error('Error in /api/todos/[id]/delete:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
} 
 