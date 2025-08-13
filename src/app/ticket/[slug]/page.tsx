"use client";

import { notFound, useParams } from 'next/navigation';
import SectionTitle from '../../../components/atoms/SectionTitle';
import Card from '../../../components/atoms/Card';
import type { ParentTask, SubTask } from '../../../types';

export default function TicketDetail() {
  const { slug } = useParams<{ slug: string }>();

  const data: ParentTask & { children: SubTask[] } = {
    id: 1,
    title: '実験プロトコルv2の確定',
    user: '田中 太郎',
    due: '2025-05-30',
    description: 'プロトコルの最終版を策定し、全員に共有。装置設定とサンプル処理の標準化を含む。',
    slug: 'protocol-v2-finalize',
    status: 'in_progress',
    priority: 'high',
    commentsCount: 3,
    updatedAt: '2d ago',
    children: [
      { id: 11, title: '前処理スクリプトの整理', user: '佐藤 花子', due: '2025-05-15', done: true, commentsCount: 1, updatedAt: '1d ago' },
      { id: 12, title: '装置Aのキャリブレーション', user: '鈴木 次郎', due: '2025-05-20', done: false, commentsCount: 2, updatedAt: '3h ago' },
    ],
  };

  if (slug !== 'protocol-v2-finalize') notFound();

  return (
    <div className="space-y-6">
      <SectionTitle icon={null}>Ticket detail</SectionTitle>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-medium text-neutral-900 truncate">{data.title}</h1>
            <p className="mt-1 text-sm text-neutral-700">{data.description}</p>
            <div className="mt-2 text-sm text-neutral-700 flex flex-wrap gap-4">
              <span>Status: {data.status}</span>
              <span>Priority: {data.priority}</span>
              <span>due {data.due}</span>
            </div>
          </div>
          <span className="text-sm text-neutral-600 shrink-0">{data.user}</span>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">Subtasks</h2>
        <ul className="space-y-2">
          {data.children.map((s) => (
            <li key={s.id} className="text-sm text-neutral-800 flex items-center justify-between">
              <span className="truncate">{s.title}</span>
              {s.due && <span className="text-neutral-500 ml-2">due {s.due}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
} 