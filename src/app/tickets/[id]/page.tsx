'use client';

import React, { use, useEffect, useState } from 'react';
import InlineEditable from '../../../components/atoms/InlineEditable';
import LoadingSpinner from '../../../components/atoms/LoadingSpinner';
import { Ticket } from '../../../types';

interface TicketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps): React.ReactElement {
  const resolved = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [children, setChildren] = useState<Ticket[]>([]);
  const [ancestors, setAncestors] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<{ id: string; name: string; color: string } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/tickets/${resolved.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTicket(data.ticket as Ticket);
        setChildren((data.children || []) as Ticket[]);
        setAncestors((data.ancestors || []) as Ticket[]);
        setTopic((data.researchTopic || null) as { id: string; name: string; color: string } | null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [resolved.id]);

  if (isLoading) return <LoadingSpinner fullScreen message="チケットを読み込み中..." />;
  if (error || !ticket) return <div className="p-6 text-red-600">{error || 'Not found'}</div>;

  return (
    <div className="h-screen w-full bg-white text-neutral-900">
      <div className="h-full">
        <div className="min-h-full pt-8 pl-5 pr-4">
          {/* 研究テーマ名（上部） */}
          {topic && (
            <div className="mb-2 pl-2 flex items-center gap-2 text-[13px] text-neutral-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: topic.color }}
              />
              <span className="font-medium">{topic.name}</span>
            </div>
          )}

          <div className="mb-3 pl-2">
            <InlineEditable
              value={ticket.title as unknown as string}
              placeholder="無題のチケット"
              variant="title"
              onSave={async (next: string) => {
                try {
                  const res = await fetch(`/api/tickets/${resolved.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: next })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setTicket(data.ticket as Ticket);
                  }
                } catch (_) {}
              }}
            />
          </div>

          {/* パンくず（祖先） */}
          {ancestors.length > 0 && (
            <div className="text-[12px] text-neutral-500 mb-4">
              {ancestors
                .slice()
                .reverse()
                .map((a, idx) => (
                  <span key={a.id}>
                    {idx > 0 && ' / '} {a.title}
                  </span>
                ))}
            </div>
          )}

          {/* 2カラム: 左コンテンツ / 右プロパティ */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
            {/* 左カラム */}
            <div className="pl-2 pt-2">
              {/* 説明 */}
              <section className="mb-4">
                <InlineEditable
                  value={(ticket.description as unknown as string) || ''}
                  placeholder="説明を追加"
                  variant="body"
                  className="min-h-[24px] text-[15px] leading-7"
                  onSave={async (next: string) => {
                    try {
                      const res = await fetch(`/api/tickets/${resolved.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ description: next })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setTicket(data.ticket as Ticket);
                      }
                    } catch (_) {}
                  }}
                />
              </section>

              {/* サブチケット */}
              <section className="rounded-lg border border-neutral-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] text-neutral-600">サブチケット</div>
                  <button
                    type="button"
                    className="text-[12px] px-2 py-1 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    aria-label="Add sub-issues"
                  >
                    + Add sub-issues
                  </button>
                </div>
                {children.length === 0 ? (
                  <div className="text-[13px] text-neutral-500">サブチケットはありません</div>
                ) : (
                  <ul className="space-y-1">
                    {children.map((c: Ticket) => (
                      <li key={c.id} className="flex items-center justify-between py-1">
                        <div className="text-sm text-neutral-900 truncate">{c.title}</div>
                        <div className="text-xs text-neutral-500">{c.status}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* アクティビティ */}
              <section className="rounded-lg border border-neutral-200 p-4 mb-4">
                <div className="text-[13px] text-neutral-600 mb-2">Activity</div>
                <div className="text-[13px] text-neutral-500">まだアクティビティはありません</div>
              </section>

              {/* コメント入力 */}
              <section className="rounded-lg border border-neutral-200 p-3">
                <label htmlFor="comment" className="sr-only">コメント</label>
                <textarea
                  id="comment"
                  className="w-full min-h-[100px] resize-y rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  placeholder="Leave a comment..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white hover:opacity-90"
                  >
                    コメントを追加
                  </button>
                </div>
              </section>
            </div>

            {/* 右カラム（プロパティ） */}
            <aside className="lg:sticky lg:top-2 h-fit">
              <section className="rounded-lg border border-neutral-200 p-4 mb-4">
                <div className="text-[13px] text-neutral-600 mb-1">ステータス</div>
                <div className="text-sm font-medium">{ticket.status}</div>
              </section>

              <section className="rounded-lg border border-neutral-200 p-4 mb-4">
                <div className="text-[13px] text-neutral-600 mb-1">担当</div>
                <div className="text-sm text-neutral-700">
                  {ticket.assigned_user ? (ticket.assigned_user as unknown as { name: string }).name : '未割り当て'}
                </div>
              </section>

              <section className="rounded-lg border border-neutral-200 p-4">
                <div className="text-[13px] text-neutral-600 mb-1">期限</div>
                <div className="text-sm text-neutral-700">
                  {ticket.due_date ? (ticket.due_date as unknown as string) : '未設定'}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}


