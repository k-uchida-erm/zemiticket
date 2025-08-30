"use client";
import IconClose from '../../atoms/icons/Close';
import { RefObject } from 'react';

interface TicketDetailHeaderProps {
	isFullscreen: boolean;
	onToggleFullscreen: () => void;
	onClose?: () => void;
	dirty: boolean;
	onSave: () => Promise<void> | void;
	onCancel: () => void;
	titleRef: RefObject<HTMLDivElement | null>;
	descRef: RefObject<HTMLDivElement | null>;
	onInputTitle: (text: string) => void;
	onInputDesc: (text: string) => void;
	editableDue: string;
	onChangeDue: (v: string) => void;
	epicLabel?: string;
	totalHours: number;
}

export default function TicketDetailHeader({ isFullscreen, onToggleFullscreen, onClose, dirty, onSave, onCancel, titleRef, descRef, onInputTitle, onInputDesc, editableDue, onChangeDue, epicLabel = '未分類', totalHours }: TicketDetailHeaderProps) {
	return (
		<>
			{/* Top-right actions */}
			<div className="absolute top-4 right-0 flex items-center gap-2">
				{/* 右上の保存ボタン - チケット名・詳細の編集用 */}
				{dirty && (
					<>
						<button onClick={onSave} className="px-3 py-1.5 text-[12px] rounded bg-[#00b393] text-white">Save</button>
						<button onClick={onCancel} className="px-3 py-1.5 text-[12px] rounded border border-neutral-300 text-neutral-700 bg-white">Cancel</button>
					</>
				)}
				<button onClick={onToggleFullscreen} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-50 text-neutral-600" aria-label="Toggle fullscreen">
					<span className="[&_svg]:w-4 [&_svg]:h-4">{isFullscreen ? <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 9 15 3 21 3'/><polyline points='9 15 3 15 3 21'/><polyline points='21 9 21 3 15 3'/><polyline points='3 21 9 21 9 15'/></svg> : <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 3 21 3 21 9'/><polyline points='9 21 3 21 3 15'/><polyline points='21 15 21 21 15 21'/><polyline points='3 9 3 3 9 3'/></svg>}</span>
				</button>
				{onClose && (
					<button onClick={onClose} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-50 text-neutral-600" aria-label="Close">
						<IconClose />
					</button>
				)}
			</div>

			{/* Epic name and total hours */}
			<div className="mt-0">
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center text-[12px] px-2 py-[2px] rounded-full border border-neutral-300 text-neutral-700 bg-white">
						{epicLabel}
					</span>
					{/* 時間チップ */}
					<div className="flex items-center gap-2">
						<span className="shrink-0 text-[10px] px-1.5 py-[1px] rounded-full bg-indigo-700 text-white">
							{totalHours}h
						</span>
					</div>
				</div>
			</div>

			{/* Inline editable title */}
			<div className="mt-3">
				<div
					role="textbox"
					contentEditable
					suppressContentEditableWarning
					onInput={(e) => onInputTitle((e.target as HTMLElement).innerText)}
					ref={titleRef}
					className="outline-none focus:outline-none text-[20px] leading-7 font-semibold text-neutral-900 whitespace-pre-wrap break-words min-h-[2rem]"
					aria-label="Title"
				></div>
			</div>

			{/* Inline editable description */}
			<div className="mt-2">
				<div
					role="textbox"
					contentEditable
					suppressContentEditableWarning
					onInput={(e) => onInputDesc((e.target as HTMLElement).innerText)}
					ref={descRef}
					className="outline-none focus:outline-none text-[13px] leading-6 text-neutral-700 whitespace-pre-wrap break-words min-h-[1.5rem]"
					aria-label="Description"
				></div>
			</div>

			{/* Due (minimal date picker) */}
			<div className="mt-4">
				<div className="text-[11px] text-neutral-600 mb-1">Due</div>
				<input
					type="date"
					value={editableDue}
					onChange={(e) => onChangeDue(e.target.value)}
					className="border border-neutral-300 rounded px-2 py-1 text-[13px] w-[160px]"
				/>
			</div>
		</>
	);
} 
 
 
 
 
 
 
 
 
 
 
 
 
 