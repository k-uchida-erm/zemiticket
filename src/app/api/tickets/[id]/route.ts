import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    if (!id) {
      return NextResponse.json({ error: 'Missing ticket id' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // ticket本体
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 直下の子
    const { data: children } = await supabase
      .from('tickets')
      .select('*')
      .eq('parent_id', id)
      .order('created_at', { ascending: true });

    // 親チェーン（祖先）
    const ancestors: Array<Record<string, unknown>> = [];
    let cursorParentId: string | null = ticket.parent_id;
    while (cursorParentId) {
      const { data: parent } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', cursorParentId)
        .single();
      if (!parent) break;
      ancestors.push(parent);
      cursorParentId = (parent as { parent_id: string | null }).parent_id ?? null;
    }

    // 研究テーマ情報（名前・カラー）
    let researchTopic: { id: string; name: string; color: string } | null = null;
    if ((ticket as { research_topic_id?: string | null }).research_topic_id) {
      const { data: topic } = await supabase
        .from('research_topics')
        .select('id, name, color')
        .eq('id', (ticket as { research_topic_id: string }).research_topic_id)
        .single();
      if (topic) researchTopic = topic as { id: string; name: string; color: string };
    }

    return NextResponse.json({ ticket, children: children || [], ancestors, researchTopic });
  } catch (error) {
    console.error('Error in tickets/[id] GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];
    if (!id) return NextResponse.json({ error: 'Missing ticket id' }, { status: 400 });

    const body = await request.json();
    const { title, description } = body as { title?: string; description?: string };
    if (title === undefined && description === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const payload: Record<string, unknown> = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;

    const { data, error } = await supabase
      .from('tickets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ticket: data });
  } catch (e) {
    console.error('Error in tickets/[id] PATCH:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


