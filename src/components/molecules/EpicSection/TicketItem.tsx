'use client';

import Link from 'next/link';

import React, { useEffect, useRef, useState } from 'react';
import { getDueDateColorClass, getDueDateDisplay } from '../../../lib/dateUtils';
import { calculateStatusChangeImpact, canChangeStatus, getAncestorsToDowngrade, TicketStatus } from '../../../lib/utils/ticketStatusUtils';
import { Ticket } from '../../../types';
import IconUser from '../../atoms/icons/User';
import StatusChangeModal from '../../molecules/StatusChangeModal';

interface TicketItemProps {
  ticket: Ticket;
  subTickets?: Ticket[];
  onToggleExpanded?: (ticketId: string) => void;
  onStatusChange?: (ticketId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done', affectedIds?: string[]) => void;
  isExpanded?: boolean;
  level?: number;
  allTickets?: Ticket[];
}

export default function TicketItem({
  ticket,
  subTickets = [],
  onToggleExpanded,
  onStatusChange,
  isExpanded = false,
  level = 0,
  allTickets = []
}: TicketItemProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<TicketStatus | null>(null);
  const [affectedTickets, setAffectedTickets] = useState<Ticket[]>([]);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [localStatus, setLocalStatus] = useState<TicketStatus>(ticket.status as TicketStatus);
  const statusRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggleExpanded) {
      onToggleExpanded(ticket.id);
    }
  };

  const handleStatusClick = () => {
    // debug
    if (process.env.NODE_ENV === 'development') {
      console.log('[TicketItem] toggle status popup', { ticketId: ticket.id, current: ticket.status });
    }
    setShowStatusPopup(!showStatusPopup);
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    // debug
    if (process.env.NODE_ENV === 'development') {
      console.log('[TicketItem] handleStatusChange start', { ticketId: ticket.id, from: ticket.status, to: newStatus });
    }

    // 親チケットをdoneにする時は、直下の未完了サブチケットがあればモーダル表示（先に反映しない）
    if (newStatus === 'done' && subTickets && subTickets.length > 0) {
      const incompleteSubs = subTickets.filter((c) => c.status !== 'done');
      if (incompleteSubs.length > 0) {
        setAffectedTickets(incompleteSubs);
        setPendingStatusChange('done');
        setModalMessage(`親チケットを完了にしますか？\n未完了のサブタスク: ${incompleteSubs.length}件\n\nこれらのサブタスクも同時に完了にしますか？`);
        setShowStatusModal(true);
        setShowStatusPopup(false);
        return;
      }
    }

    // 即時ローカル反映（子や確認不要の親のみ）
    setLocalStatus(newStatus);
    // 子操作で親がdoneのときにin_progressへ戻すケースはモーダルなしで自動降格
    if (newStatus === 'in_progress' && ticket.parent_id) {
      const ancestors = getAncestorsToDowngrade(ticket, allTickets);
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] ancestors to downgrade', ancestors.map(a => ({ id: a.id, title: a.title, status: a.status })));
      }
      if (ancestors.length > 0) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('[TicketItem] POST update-status (auto downgrade ancestors)');
          }
          const response = await fetch('/api/tickets/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticketId: ticket.id,
              status: 'in_progress',
              bulkUpdate: true,
              affectedTicketIds: ancestors.map(t => t.id)
            })
          });
          if (process.env.NODE_ENV === 'development') {
            console.log('[TicketItem] update-status response', response.status);
          }
          if (response.ok) {
            if (onStatusChange) onStatusChange(ticket.id, 'in_progress', ancestors.map(t => t.id));
            setShowStatusPopup(false);
            return;
          }
        } catch {
          if (process.env.NODE_ENV === 'development') {
            console.error('[TicketItem] update-status failed, fallback to normal flow');
          }
          // フォールバック: 通常フローへ
        }
      }
    }

    // ステータス変更の可否をチェック
    const result = canChangeStatus(ticket, newStatus, allTickets);
    if (process.env.NODE_ENV === 'development') {
      console.log('[TicketItem] canChangeStatus result', { result });
    }

    if (!result.success) {
      if (result.requiresConfirmation) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[TicketItem] requiresConfirmation true');
        }
        // 親をdoneにするが子が未完了 → 子を一括done（親操作のみモーダル）
        const impact = calculateStatusChangeImpact(ticket, newStatus, allTickets);
        if (process.env.NODE_ENV === 'development') {
          console.log('[TicketItem] calculated impact', { direct: impact.directImpact.map(t => t.id), indirect: impact.indirectImpact.map(t => t.id) });
        }
        setAffectedTickets(impact.directImpact);
        setPendingStatusChange(newStatus);
        setModalMessage(`サブタスクが未完了のため、親チケットを完了にできません。\n未完了のサブタスク: ${impact.directImpact.length}件\n\nこれらのサブタスクも同時に完了にしますか？`);
        setShowStatusModal(true);
        setShowStatusPopup(false);
        return;
      }

      // 確認不要の失敗は簡易通知
      if (process.env.NODE_ENV === 'development') {
        console.warn('[TicketItem] change blocked without confirmation', result.message);
      }
      alert(result.message);
      setShowStatusPopup(false);
      return;
    }

    // 通常のステータス変更（楽観的更新 → 非同期POST）
    if (onStatusChange) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] notifying parent onStatusChange (optimistic)', { id: ticket.id, newStatus });
      }
      // 子チケットの即時反映
      onStatusChange(ticket.id, newStatus);

      // 親チケットの即時反映（自動完了/降格）
      // 親の即時計算はページ側の再計算に委譲（ロジック統一のため）
    }
    setShowStatusPopup(false);

    // 非同期でAPI更新（失敗時はログのみ）
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] POST update-status (normal)');
      }
      const res = await fetch('/api/tickets/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, status: newStatus })
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] update-status response (normal)', res.status);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TicketItem] update-status error (normal)', e);
      }
    }
  };

  // 外部からのstatus更新に同期（実際に差分がある場合のみ）
  useEffect(() => {
    const next = ticket.status as TicketStatus;
    setLocalStatus((prev) => (prev !== next ? next : prev));
  }, [ticket.status]);

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      const affectedIds = affectedTickets.map(t => t.id);
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] confirmStatusChange (optimistic first)', { ticketId: ticket.id, to: pendingStatusChange, affected: affectedIds });
      }

      // 楽観的反映（親にも伝搬）
      setLocalStatus(pendingStatusChange as TicketStatus);
      if (onStatusChange) {
        onStatusChange(ticket.id, pendingStatusChange as TicketStatus, affectedIds);
      }
      setShowStatusModal(false);
      setPendingStatusChange(null);
      setAffectedTickets([]);

      // API更新（非同期）
      const response = await fetch('/api/tickets/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          status: pendingStatusChange,
          bulkUpdate: true,
          affectedTicketIds: affectedIds
        }),
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[TicketItem] confirm update-status response', response.status);
      }
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to update ticket status');
        }
        alert('ステータスの更新に失敗しました');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating ticket status:', error);
      }
      alert('ステータスの更新中にエラーが発生しました');
    }
  };

  // ポップアップの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusPopup(false);
      }
    };

    if (showStatusPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStatusPopup]);

  const hasChildren = subTickets && subTickets.length > 0;

  return (
    <>
      <li className="flex items-center gap-3 px-2.5 py-2 hover:bg-neutral-50">
        <button
          type="button"
          className="h-4 w-4 shrink-0 text-neutral-500 flex items-center justify-center hover:text-neutral-700 focus:outline-none focus:ring-0"
          onClick={handleToggle}
          disabled={!hasChildren}
        >
          {hasChildren && (
            <svg
              className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
              viewBox="0 0 6 6"
              fill="currentColor"
            >
              <path d="M1 2l2 2 2-2" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </svg>
          )}
        </button>
        <div className="relative flex items-center">
          <div
            ref={statusRef}
            className="inline-flex items-center justify-center h-4 w-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleStatusClick}
          >
            {localStatus === 'in_progress' ? (
              <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
            ) : localStatus === 'todo' ? (
              <div className="h-4 w-4 rounded-sm border-2 border-neutral-300 bg-white"></div>
            ) : localStatus === 'review' ? (
              <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
            ) : localStatus === 'done' ? (
              <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" fill="none"/>
                </svg>
              </div>
            ) : (
              <div className="h-4 w-4 rounded-sm bg-neutral-200"></div>
            )}
          </div>

          {/* ステータス変更ポップアップ */}
          {showStatusPopup && (
            <div
              ref={popupRef}
              className="absolute top-6 left-0 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[160px]"
            >
              {/* ヘッダー */}
              <div className="px-3 py-2 text-xs font-medium text-neutral-600 border-b border-neutral-100">
                Change Status
              </div>

              <button
                onClick={() => handleStatusChange('todo')}
                className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex items-center gap-2"
              >
                <div className="h-3 w-3 rounded-sm border border-neutral-300 bg-white"></div>
                <span>To do</span>
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex items-center gap-2"
              >
                <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                </div>
                <span>In progress</span>
              </button>
              <button
                onClick={() => handleStatusChange('review')}
                className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex items-center gap-2"
              >
                <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                </div>
                <span>In Review</span>
              </button>
              <button
                onClick={() => handleStatusChange('done')}
                className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50 flex items-center gap-2"
              >
                <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" fill="none"/>
                  </svg>
                </div>
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/tickets/${ticket.id}`} className="truncate block text-[13px] font-medium text-neutral-600 hover:no-underline">
            {ticket.title}
          </Link>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-neutral-500 pr-2">
          <span className={`text-[10px] ${getDueDateColorClass(ticket.due_date, localStatus)}`}>
            {getDueDateDisplay(ticket.due_date, localStatus)}
          </span>
          {ticket.assigned_user ? (
            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-medium leading-none">
                {ticket.assigned_user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <IconUser className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </li>

      {/* サブチケットの表示 */}
      {hasChildren && !isCollapsed && (
        <li className="ml-4">
          <ul className="space-y-0">
            {subTickets.map((child) => (
              <TicketItem
                key={child.id}
                ticket={child}
                subTickets={child.children}
                onToggleExpanded={onToggleExpanded}
                onStatusChange={onStatusChange}
                level={level + 1}
                allTickets={allTickets}
              />
            ))}
          </ul>
        </li>
      )}

      {/* ステータス変更確認モーダル */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingStatusChange(null);
          setAffectedTickets([]);
        }}
        onConfirm={handleConfirmStatusChange}
        ticket={ticket}
        newStatus={pendingStatusChange || 'todo'}
        affectedTickets={affectedTickets}
        message={modalMessage}
      />
    </>
  );
}
