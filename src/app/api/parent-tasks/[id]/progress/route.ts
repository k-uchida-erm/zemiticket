import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// 環境変数を確認
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			console.error('Missing Supabase environment variables');
			return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		);

		console.log('Fetching progress for parent task:', params.id);

		const { data, error } = await supabase
			.from('parent_tasks')
			.select('progress_percentage')
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Supabase query error:', error);
			throw error;
		}

		console.log('Progress data retrieved:', data);
		return NextResponse.json({ progressPercentage: data.progress_percentage });
	} catch (error) {
		console.error('Progress fetch failed:', error);
		return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
	}
} 