"use client";

import { useState } from 'react';
import IconPlus from '../../atoms/icons/Plus';

interface AddSubticketRowProps {
	adding: boolean;
	title: string;
	onTitleChange: (title: string) => void;
	due?: string;
	onDueChange?: (due: string) => void;
	onSubmit: () => void;
	onCancel: () => void;
}

export default function AddSubticketRow({ 
	adding, 
	title, 
	onTitleChange, 
	due, 
	onDueChange, 
	onSubmit, 
	onCancel 
}: AddSubticketRowProps) {
	if (!adding) return null;

	return (
		<div className="mt-3 p-3 border border-neutral-200 rounded-md bg-neutral-50">
			<div className="flex items-center gap-2 mb-2">
				<input
					type="text"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					placeholder="Subticket title"
					className="flex-1 text-sm px-2 py-1 border border-neutral-300 rounded"
				/>
				{onDueChange && (
					<input
						type="date"
						value={due || ''}
						onChange={(e) => onDueChange(e.target.value)}
						className="text-sm px-2 py-1 border border-neutral-300 rounded"
					/>
				)}
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onSubmit}
					disabled={!title.trim()}
					className="px-3 py-1 text-xs bg-[#00b393] text-white rounded hover:bg-[#00b393]/90 disabled:opacity-50"
				>
					Add
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-800"
				>
					Cancel
				</button>
			</div>
		</div>
	);
} 