"use client";

import { useMemo, useState, useCallback } from 'react';
import TicketKanban from '../../components/organisms/TicketKanban';
import AllTicketParentCard from '../../components/molecules/AllTicketParentCard';
import type { ParentTask, SubTask } from '../../types';
import SectionTitle from '../../components/atoms/SectionTitle';
import IconList from '../../components/atoms/icons/List';
import TicketDetailPanel from '../../components/organisms/TicketDetailPanel';
import IconPlus from '../../components/atoms/icons/Plus';
import TicketCreateForm from '../../components/molecules/TicketCreateForm';
import SubHeader from '../../components/molecules/SubHeader';

export default function TicketIndexPage() {
	const [selected, setSelected] = useState<ParentTask | null>(null);
	const [creatingEpic, setCreatingEpic] = useState<string | null>(null);
	const [rightView, setRightView] = useState<'kanban' | 'timeline'>('kanban');
	const onSelect = useCallback((p: ParentTask) => setSelected(p), []);
	const onClose = useCallback(() => { setSelected(null); setCreatingEpic(null); }, []);
	// Compose parent tickets with subtasks to mirror home but more compact
	const parents: { parent: ParentTask; children: SubTask[] }[] = [
		{
			parent: { id: 1, title: '実験プロトコルv2の確定', user: '田中 太郎', due: '2025-05-30', progressPercentage: 40, description: 'プロトコルの最終版を策定し、全員に共有。', slug: 'protocol-v2-finalize', status: 'in_progress', priority: 'high', commentsCount: 3, updatedAt: '2d ago', estimateHours: 12, epic: 'プロトコルv2' },
			children: [
				{ id: 11, title: '前処理スクリプトの整理', user: '佐藤 花子', due: '2025-05-15', done: true, description: '不要関数の削除と共通化', slug: 'cleanup-preprocess', status: 'done', priority: 'medium', commentsCount: 1, updatedAt: '1d ago', estimateHours: 2, todos: [
					{ id: 111, title: '不要関数の削除', done: true, estimateHours: 0.5 },
					{ id: 112, title: '共通ユーティリティ化', done: true, estimateHours: 1.5 },
				] },
				{ id: 12, title: '装置Aのキャリブレーション', user: '鈴木 次郎', due: '2025-05-20', done: false, description: '温度ドリフトの補正', slug: 'calibrate-device-a', status: 'in_progress', priority: 'urgent', commentsCount: 2, updatedAt: '3h ago', estimateHours: 3, todos: [
					{ id: 121, title: '温度センサー初期化', done: true, estimateHours: 0.5 },
					{ id: 122, title: '基準サンプル測定', done: false, estimateHours: 1 },
					{ id: 123, title: 'ドリフト補正適用', done: false, estimateHours: 1.5 },
				] },
			],
		},
		{
			parent: { id: 2, title: '論文ドラフト(導入/関連研究)改稿', user: '高橋 美咲', due: '2025-06-05', progressPercentage: 60, description: 'レビューコメントを反映し、構成を簡潔に整理する。', slug: 'paper-draft-revise-intro-related', status: 'review', priority: 'medium', commentsCount: 4, updatedAt: '6h ago', estimateHours: 16, epic: '論文ドラフト' },
			children: [
				{ id: 21, title: '引用箇所の再確認', user: '高橋 美咲', due: '2025-05-25', done: true, description: '2019年以降の文献のみ', slug: 'crosscheck-citations', status: 'done', priority: 'low', commentsCount: 2, updatedAt: '1d ago', estimateHours: 1, todos: [
					{ id: 211, title: '新規文献収集', done: true, estimateHours: 0.5 },
					{ id: 212, title: '重複・古い引用の整理', done: true, estimateHours: 0.5 },
				] },
				{ id: 22, title: '章構成レビュー反映', user: '田中 太郎', due: '2025-05-28', done: false, description: '導入の重複を削除', slug: 'apply-structure-feedback', status: 'in_progress', priority: 'medium', commentsCount: 1, updatedAt: '2h ago', estimateHours: 2, todos: [
					{ id: 221, title: '導入の重複箇所抽出', done: true, estimateHours: 0.5 },
					{ id: 222, title: '関連研究の段落再配置', done: false, estimateHours: 1 },
					{ id: 223, title: '整合性チェック', done: false, estimateHours: 0.5 },
				] },
			],
		},
	];

	const groupedByEpic = useMemo(() => {
		const map = new Map<string, { parent: ParentTask; children: SubTask[] }[]>();
		for (const g of parents) {
			const key = g.parent.epic || '未分類';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(g);
		}
		return Array.from(map.entries());
	}, [parents]);

	// Flatten to tickets for Kanban
	const kanbanTickets = useMemo(() => {
		return parents.map((g) => ({
			id: g.parent.id,
			title: g.parent.title,
			user: g.parent.user,
			slug: g.parent.slug,
			status: g.parent.status,
			priority: g.parent.priority,
			commentsCount: g.parent.commentsCount,
			updatedAt: g.parent.updatedAt,
			epic: g.parent.epic,
		}));
	}, [parents]);

	return (
		<div className="grid grid-cols-10 gap-6">
			<div className="col-span-3 space-y-2">
				<section>
					<SectionTitle icon={<IconList />}>All tickets</SectionTitle>
				</section>
				<div className="mt-5 space-y-3 relative pl-2">
					<div className="absolute top-0 bottom-0 left-0 border-l-2 border-[#00b393]/50 pointer-events-none"></div>
					{groupedByEpic.map(([epic, list]) => (
						<div key={epic} className="relative pt-6 pb-3">
							<div className="absolute -left-[20px] -top-2 z-10 flex items-center gap-1.5">
								<span className="inline-flex items-center rounded-full border border-[#00b393] bg-white text-neutral-700 text-[11px] px-2 py-[3px] leading-tight">
									{epic}
									<span className="ml-1 text-[10px] text-neutral-400">{list.length}</span>
								</span>
								<button onClick={() => setCreatingEpic(epic)} className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
									<span className="[&_svg]:w-3.5 [&_svg]:h-3.5"><IconPlus /></span>
								</button>
							</div>
							<div className="mt-1 space-y-1.5">
								{list.map((g) => (
									<AllTicketParentCard
										key={g.parent.id}
										parent={g.parent}
										subtasks={g.children}
										onSelect={onSelect}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="col-span-7 border-l border-neutral-200 relative overflow-hidden">
				<div className="min-h-[calc(100vh-4rem)] px-6">
					<SubHeader items={[{ key: 'kanban', label: 'Kanban' }, { key: 'timeline', label: 'Timeline' }]} activeKey={rightView} onChange={(k) => setRightView(k as 'kanban' | 'timeline')} />
					<div className="pt-3">
						{rightView === 'kanban' ? (
							<TicketKanban tickets={kanbanTickets} />
						) : (
							<section>
								<div className="text-[13px] text-neutral-600">Timeline coming soon...</div>
							</section>
						)}
					</div>
				</div>
				<div className={`absolute inset-0 h-full w-full bg-white transition-transform duration-300 translate-x-full ${(selected || creatingEpic) ? '!translate-x-0' : ''} z-50`}>
					<div className="overflow-auto h-full px-6 pt-0 pb-4">
						{creatingEpic ? (
							<TicketCreateForm defaultEpic={creatingEpic} onCancel={onClose} onCreate={() => onClose()} />
						) : selected ? (
							(() => {
								const group = parents.find((g) => g.parent.id === selected.id);
								return (
									<TicketDetailPanel parent={selected} children={group?.children || []} onClose={onClose} onSave={() => onClose()} />
								);
							})()
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
} 