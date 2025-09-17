import { Ticket } from '../../types';

export type TicketStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface StatusChangeResult {
  success: boolean;
  message: string;
  requiresConfirmation?: boolean;
  affectedTickets?: string[];
}

/**
 * チケットのステータス変更が許可されるかチェック
 * サブタスクが未完了の場合、親チケットを完了にできない
 */
export function canChangeStatus(
  ticket: Ticket,
  newStatus: TicketStatus,
  allTickets: Ticket[]
): StatusChangeResult {
  // チケット（親子関係に関わらず）をdoneにしようとする場合、未完の子があれば確認モーダル
  if (newStatus === 'done') {
    const childTickets = allTickets.filter(t => t.parent_id === ticket.id);
    if (childTickets.length > 0) {
      const incompleteChildren = childTickets.filter(t => t.status !== 'done');
      if (incompleteChildren.length > 0) {
        return {
          success: false,
          message: `サブタスクが未完了のため、このチケットを完了にできません。\n未完了のサブタスク: ${incompleteChildren.length}件`,
          requiresConfirmation: true,
          affectedTickets: incompleteChildren.map(t => t.id)
        };
      }
    }
  }

  // 親チケットが完了している場合、サブタスクを進行中に戻す際は確認モーダルで親（祖先）を降格可能
  if (ticket.parent_id && newStatus === 'in_progress') {
    const parentTicket = allTickets.find(t => t.id === ticket.parent_id);
    if (parentTicket && parentTicket.status === 'done') {
      const ancestors = getAncestorsToDowngrade(ticket, allTickets);
      return {
        success: false,
        message: '親チケットが完了済みです。親チケットを進行中に戻しますか？',
        requiresConfirmation: true,
        affectedTickets: ancestors.map(t => t.id)
      };
    }
  }

  return {
    success: true,
    message: ''
  };
}

/**
 * 親がdoneのときに子をin_progressへ戻す場合に、降格対象となる祖先チケット（doneのもの）を上位まで収集
 */
export function getAncestorsToDowngrade(
  ticket: Ticket,
  allTickets: Ticket[]
): Ticket[] {
  const result: Ticket[] = [];
  let cursor: Ticket | undefined = ticket;

  while (cursor?.parent_id) {
    const parent = allTickets.find(t => t.id === cursor!.parent_id);
    if (!parent) break;
    if (parent.status === 'done') {
      result.push(parent);
      cursor = parent;
      continue;
    }
    break;
  }

  return result;
}

// 親の集約ステータスを子の状態から一意に決める共通関数
export function computeAggregateStatusFromStatuses(statuses: TicketStatus[]): TicketStatus {
  if (statuses.length === 0) return 'todo';
  const allDone = statuses.every((s: TicketStatus) => s === 'done');
  if (allDone) return 'done';
  const allTodo = statuses.every((s: TicketStatus) => s === 'todo');
  if (allTodo) return 'todo';
  return 'in_progress';
}

export function computeAggregateStatusForChildren(children: Ticket[]): TicketStatus {
  const statuses = children.map((c: Ticket) => c.status as TicketStatus);
  return computeAggregateStatusFromStatuses(statuses);
}

/**
 * 親チケットのステータスを自動更新
 * 全てのサブタスクが完了した場合、親チケットも完了にする
 */
export function updateParentStatusIfNeeded(
  ticket: Ticket,
  allTickets: Ticket[]
): { shouldUpdate: boolean; newStatus?: TicketStatus } {
  if (!ticket.parent_id) return { shouldUpdate: false };

  const parentTicket = allTickets.find(t => t.id === ticket.parent_id);
  if (!parentTicket) return { shouldUpdate: false };

  const childTickets = allTickets.filter(t => t.parent_id === parentTicket.id);
  const allChildrenDone = childTickets.every(t => t.status === 'done');

  if (allChildrenDone && parentTicket.status !== 'done') {
    return { shouldUpdate: true, newStatus: 'done' };
  }

  return { shouldUpdate: false };
}

/**
 * サブタスクのステータスを一括変更
 */
export function getBulkStatusChangeTickets(
  parentTicketId: string,
  newStatus: TicketStatus,
  allTickets: Ticket[]
): Ticket[] {
  return allTickets.filter(t => t.parent_id === parentTicketId);
}

/**
 * ステータス変更の影響範囲を計算
 */
export function calculateStatusChangeImpact(
  ticket: Ticket,
  newStatus: TicketStatus,
  allTickets: Ticket[]
): {
  directImpact: Ticket[];
  indirectImpact: Ticket[];
  totalAffected: number;
} {
  const directImpact: Ticket[] = [];
  const indirectImpact: Ticket[] = [];

  // 直接影響: サブタスクの一括変更（親子階層を問わず、このチケットの直下の子）
  if (newStatus === 'done') {
    const childTickets = allTickets.filter(t => t.parent_id === ticket.id);
    directImpact.push(...childTickets);
  }

  // 間接影響: 親チケットの自動完了
  if (ticket.parent_id) {
    const parentTicket = allTickets.find(t => t.id === ticket.parent_id);
    if (parentTicket) {
      const siblings = allTickets.filter(t => t.parent_id === ticket.parent_id && t.id !== ticket.id);
      const allSiblingsDone = siblings.every(t => t.status === 'done');

      if (allSiblingsDone && newStatus === 'done' && parentTicket.status !== 'done') {
        indirectImpact.push(parentTicket);
      }
    }
  }

  return {
    directImpact,
    indirectImpact,
    totalAffected: directImpact.length + indirectImpact.length
  };
}
