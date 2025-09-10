import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import type { Ticket } from '../../../types';

// Supabaseから取得するデータの型定義
interface _SupabaseTicket {
	id: string;
	parent_id?: string;
	title: string;
	description?: string;
	slug?: string;
	status?: string;
	priority?: string;
	due_date?: string;
	progress_percentage?: number;
	estimate_hours?: number;
	actual_hours?: number;
	type?: string;
	comments_count?: number;
	created_at: string;
	updated_at: string;
	sort_order?: number;
	is_active?: boolean;
	level?: number;
	user_id?: string;
	epic_id?: string;
	users?: { name: string };
	epics?: { name: string };
	children?: _SupabaseTicket[];
	todos?: SupabaseTodo[];
}

interface SupabaseTodo {
	id: string;
	title: string;
	done?: boolean;
	in_progress?: boolean;
	estimate_hours?: number;
	sort_order?: number;
	progress_value?: number;
}

// SupabaseデータをTicket型に変換する関数
function convertToTicket(supabaseTicket: Record<string, unknown>): Ticket {
	return {
		id: supabaseTicket.id as string,
		workspace_id: supabaseTicket.workspace_id as string,
		research_topic_id: (supabaseTicket.research_topic_id as string) || undefined,
		parent_id: (supabaseTicket.parent_id as string) || undefined,
		title: supabaseTicket.title as string,
		description: (supabaseTicket.description as string) || undefined,
		slug: (supabaseTicket.slug as string) || '',
		status: (supabaseTicket.status as Ticket['status']) || 'todo',
		priority: (supabaseTicket.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
		user_id: (supabaseTicket.user_id as string) || undefined,
		due_date: (supabaseTicket.due_date as string) || undefined,
		progress_percentage: (supabaseTicket.progress_percentage as number) || 0,
		estimate_hours: (supabaseTicket.estimate_hours as number) || undefined,
		actual_hours: (supabaseTicket.actual_hours as number) || undefined,
		type: (supabaseTicket.type as 'task' | 'subtask' | 'experiment' | 'analysis' | 'admin') || undefined,
		comments_count: (supabaseTicket.comments_count as number) || 0,
		created_at: supabaseTicket.created_at as string,
		updated_at: supabaseTicket.updated_at as string,
		sort_order: (supabaseTicket.sort_order as number) || 0,
		is_active: (supabaseTicket.is_active as boolean) || false,
		level: (supabaseTicket.level as number) || 0,
		children: [],
		todos: [],
	};
}

// 階層データを構築する関数
function buildHierarchy(tickets: Ticket[]): Ticket[] {
	const ticketMap = new Map<string, Ticket>();
	const rootTickets: Ticket[] = [];

	// すべてのチケットをマップに格納
	tickets.forEach(ticket => {
		ticketMap.set(ticket.id, { ...ticket, children: [] });
	});

	// 階層関係を構築
	tickets.forEach(ticket => {
		const ticketWithChildren = ticketMap.get(ticket.id)!;
		if (ticket.parent_id) {
			const parent = ticketMap.get(ticket.parent_id);
			if (parent) {
				parent.children = parent.children || [];
				// 重複チェック
				if (!parent.children.find(child => child.id === ticketWithChildren.id)) {
					parent.children.push(ticketWithChildren);
				}
			}
		} else {
			// 重複チェック
			if (!rootTickets.find(root => root.id === ticketWithChildren.id)) {
				rootTickets.push(ticketWithChildren);
			}
		}
	});

	return rootTickets;
}

export async function GET(request: Request) {
	try {
		// 環境変数の確認
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseAnonKey) {
			console.error('Missing Supabase environment variables');
			return NextResponse.json(
				{
					error: 'Missing Supabase configuration',
					details: {
						supabaseUrl: !!supabaseUrl,
						supabaseAnonKey: !!supabaseAnonKey,
					},
				},
				{ status: 500 }
			);
		}

		const supabase = await createSupabaseServerClient();

		const url = new URL(request.url);
		const scopeParam = url.searchParams.get('scope');
		const scope = (scopeParam === 'all' ? 'all' : 'my') as 'all' | 'my';

		// チケットをすべて取得（ワークスペース内、階層・状態に関係なく）
		const { data: allRawTickets, error: allTicketsError } = await supabase
			.from('tickets')
			.select('*')
			.eq('workspace_id', '00000000-0000-0000-0000-000000000001')
			.order('level', { ascending: true })
			.order('sort_order', { ascending: true })
			.order('updated_at', { ascending: false });

		if (allTicketsError) {
			console.error('All tickets error:', allTicketsError);
			return NextResponse.json(
				{ error: 'Failed to fetch tickets' },
				{ status: 500 }
			);
		}

		const convertedAllTickets = (allRawTickets as Record<string, unknown>[])?.map(convertToTicket) || [];

		let baseTickets = convertedAllTickets;
		if (scope === 'my') {
			const { data: workspaceMembers } = await supabase
				.from('workspace_members')
				.select('user_id, users:user_id(id)')
				.eq('workspace_id', '00000000-0000-0000-0000-000000000001')
				.limit(1);
			const currentUserId = workspaceMembers && workspaceMembers.length > 0
				? (workspaceMembers[0].users?.id as string | undefined) || workspaceMembers[0].user_id
				: undefined;
			if (currentUserId) {
				baseTickets = convertedAllTickets.filter(t => t.user_id === currentUserId);
			}
		}

		const hierarchyTickets = buildHierarchy(baseTickets);

		// 研究テーマ情報を取得（display_nameとcolorも含む）
		const { data: researchTopics, error: researchTopicsError } = await supabase
			.from('research_topics')
			.select('id, name, display_name, color, workspace_id')
			.eq('workspace_id', '00000000-0000-0000-0000-000000000001')
			.order('name');

		if (researchTopicsError) {
			console.error('Research topics error:', researchTopicsError);
		}

		const researchTopicMap = new Map<string, string>();
		const researchTopicColorMap = new Map<string, string>();
		(researchTopics || []).forEach((topic: Record<string, unknown>) => {
			// display_nameがあればそれを使用、なければnameを使用
			const displayName = topic.display_name as string || topic.name as string;
			researchTopicMap.set(topic.id as string, displayName);
			researchTopicColorMap.set(topic.id as string, topic.color as string || '#6b7280');
		});

		// すべての研究テーマを初期化（チケットがない研究テーマも表示）
		const activeTicketsByResearchTopic = new Map<string, Ticket[]>();

		// まずすべての研究テーマを初期化
		(researchTopics || []).forEach((topic: Record<string, unknown>) => {
			const displayName = topic.display_name as string || topic.name as string;
			activeTicketsByResearchTopic.set(displayName, []);
		});

		// ルートチケット（level 0）を研究テーマごとにグループ化
		hierarchyTickets
			.filter(ticket => ticket.level === 0)
			.forEach(ticket => {
				const researchTopicId = ticket.research_topic_id || '未分類';
				const researchTopicName = researchTopicId === '未分類' ? '未分類' : (researchTopicMap.get(researchTopicId) || `Research Topic ${researchTopicId.substring(0, 8)}`);
				if (!activeTicketsByResearchTopic.has(researchTopicName)) {
					activeTicketsByResearchTopic.set(researchTopicName, []);
				}
				activeTicketsByResearchTopic.get(researchTopicName)!.push(ticket);
			});

		// アクティブグループの構築（研究テーマごと）
		const activeGroups = Array.from(activeTicketsByResearchTopic.entries()).map(([researchTopicName, tickets]) => {
			// 研究テーマIDを取得（最初のチケットから）
			const researchTopicId = tickets.length > 0 ? tickets[0].research_topic_id : null;
			return {
				epic: researchTopicName,
				researchTopicId: researchTopicId,
				tickets: tickets
			};
		});

		return NextResponse.json({
			activeGroups,
			researchTopicColors: Object.fromEntries(researchTopicColorMap),
		});
	} catch (error) {
		console.error('Error in /api/home:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
