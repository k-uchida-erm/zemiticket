import React from 'react';
import { TicketStatus } from '../../../lib/utils/ticketStatusUtils';
import { Ticket } from '../../../types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticket: Ticket;
  newStatus: TicketStatus;
  affectedTickets: Ticket[];
  message: string;
}

export default function StatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  ticket,
  newStatus,
  affectedTickets,
  message
}: StatusChangeModalProps): React.ReactElement {
  if (!isOpen) return <></>;

  const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
      case 'todo': return 'text-neutral-500';
      case 'in_progress': return 'text-orange-500';
      case 'review': return 'text-blue-500';
      case 'done': return 'text-emerald-500';
      default: return 'text-neutral-500';
    }
  };

  const getStatusLabel = (status: TicketStatus): string => {
    switch (status) {
      case 'todo': return 'To do';
      case 'in_progress': return 'In progress';
      case 'review': return 'In Review';
      case 'done': return 'Done';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">ステータス変更の確認</h3>
              <p className="text-sm text-neutral-500">依存関係を考慮した変更が必要です</p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm text-neutral-700 whitespace-pre-line">{message}</p>
          </div>

          {/* Ticket Info */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-neutral-500">変更対象</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900">{ticket.title}</span>
              <span className={`text-xs px-2 py-1 rounded-full bg-neutral-200 ${getStatusColor(newStatus)}`}>
                {getStatusLabel(newStatus)}
              </span>
            </div>
          </div>

          {/* Affected Tickets */}
          {affectedTickets.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-neutral-500">
                  同時に変更されるチケット ({affectedTickets.length}件)
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {affectedTickets.map((affectedTicket) => (
                  <div key={affectedTicket.id} className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-600 flex-1 truncate">{affectedTicket.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-neutral-200 ${getStatusColor(newStatus)}`}>
                      {getStatusLabel(newStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
            >
              変更を実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
