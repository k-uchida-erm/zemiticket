import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { computeAggregateStatusFromStatuses, TicketStatus } from '../../../../lib/utils/ticketStatusUtils';

export async function POST(request: NextRequest) {
  try {
    const { ticketId, status, bulkUpdate = false, affectedTicketIds = [] } = await request.json();
    console.log('[API] update-status input', { ticketId, status, bulkUpdate, affectedCount: affectedTicketIds.length });

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'ticketId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // メインのチケットを更新
    const { data: mainTicket, error: mainError } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
      .select();

    if (mainError) {
      console.error('Error updating main ticket status:', mainError);
      return NextResponse.json(
        { error: 'Failed to update ticket status' },
        { status: 500 }
      );
    }

    // 一括更新が必要な場合
    if (bulkUpdate && affectedTicketIds.length > 0) {
      console.log('[API] bulk update targets', affectedTicketIds);
      const { error: bulkError } = await supabase
        .from('tickets')
        .update({ status })
        .in('id', affectedTicketIds);

      if (bulkError) {
        console.error('Error updating bulk tickets:', bulkError);
        return NextResponse.json(
          { error: 'Failed to update related tickets' },
          { status: 500 }
        );
      }
    }

    // 親チケットの自動更新（祖先まで伝搬）
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('parent_id')
      .eq('id', ticketId)
      .single();

    const updatedAncestors: Array<{ id: string; status: 'todo' | 'in_progress' | 'done' }> = [];
    let currentParentId: string | null | undefined = ticketData?.parent_id;
    while (currentParentId) {
      // 現在の親の子ステータスを取得
      const { data: children, error: childrenError } = await supabase
        .from('tickets')
        .select('id, status')
        .eq('parent_id', currentParentId);
      if (childrenError) {
        console.error('Error fetching children for parent', currentParentId, childrenError);
        break;
      }

      const statuses = (children || []).map((c: { status: string }) => c.status as TicketStatus);
      const nextParentStatus = computeAggregateStatusFromStatuses(statuses);

      // 親の現在値を取得
      const { data: parentRow } = await supabase
        .from('tickets')
        .select('id, status, parent_id')
        .eq('id', currentParentId)
        .single();

      if (!parentRow) break;

      if (parentRow.status !== nextParentStatus) {
        console.log('[API] recompute parent', { parentId: currentParentId, nextParentStatus });
        await supabase
          .from('tickets')
          .update({ status: nextParentStatus })
          .eq('id', currentParentId);
        updatedAncestors.push({ id: currentParentId, status: nextParentStatus });
      } else {
        // 変更がなくても返してフロント側と整合を取れるようにする
        updatedAncestors.push({ id: currentParentId, status: parentRow.status as 'todo' | 'in_progress' | 'done' });
      }

      currentParentId = (parentRow as { parent_id: string | null }).parent_id;
    }

    return NextResponse.json({
      success: true,
      data: mainTicket,
      bulkUpdated: bulkUpdate ? affectedTicketIds.length : 0,
      updatedAncestors
    });
  } catch (error) {
    console.error('Error in update-status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
