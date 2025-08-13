"use client";

import { useState } from 'react';

interface Props {
	defaultEpic?: string;
	onCancel?: () => void;
	onCreate?: (data: { title: string; epic?: string; description?: string; estimateHours?: number }) => void;
}

export default function TicketCreateForm({ defaultEpic, onCancel, onCreate }: Props) {
	const [title, setTitle] = useState('');
	const [epic, setEpic] = useState(defaultEpic || '');
	const [description, setDescription] = useState('');
	const [estimate, setEstimate] = useState<string>('');

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onCreate?.({ title, epic: epic || undefined, description: description || undefined, estimateHours: estimate ? Number(estimate) : undefined });
			}}
			className="space-y-3"
		>
			<div>
				<label className="block text-[12px] text-neutral-600 mb-1">Title</label>
				<input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-neutral-300 rounded px-2 py-1 text-[13px]" placeholder="タイトル" />
			</div>
			<div>
				<label className="block text-[12px] text-neutral-600 mb-1">Epic</label>
				<input value={epic} onChange={(e) => setEpic(e.target.value)} className="w-full border border-neutral-300 rounded px-2 py-1 text-[13px]" placeholder="エピック" />
			</div>
			<div>
				<label className="block text-[12px] text-neutral-600 mb-1">Description</label>
				<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-300 rounded px-2 py-1 text-[13px] h-24" placeholder="概要" />
			</div>
			<div>
				<label className="block text-[12px] text-neutral-600 mb-1">Estimate (h)</label>
				<input value={estimate} onChange={(e) => setEstimate(e.target.value)} className="w-full border border-neutral-300 rounded px-2 py-1 text-[13px]" placeholder="例: 4" />
			</div>
			<div className="flex items-center justify-end gap-2 pt-2">
				<button type="button" onClick={onCancel} className="px-3 py-1.5 text-[12px] rounded border border-neutral-300 text-neutral-700">キャンセル</button>
				<button type="submit" className="px-3 py-1.5 text-[12px] rounded bg-[#00b393] text-white">作成</button>
			</div>
		</form>
	);
} 