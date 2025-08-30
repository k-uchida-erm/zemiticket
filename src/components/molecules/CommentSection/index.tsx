"use client";

import { useState } from 'react';
import IconChat from '../../atoms/icons/Chat';
import IconChevronDown from '../../atoms/icons/ChevronDown';
import IconPlus from '../../atoms/icons/Plus';
import IconCheck from '../../atoms/icons/Check';
import IconClose from '../../atoms/icons/Close';

interface Comment {
	id: string;
	text: string;
	author: string;
	timestamp: string;
}

interface CommentSectionProps {
	comments?: Comment[];
	onAddComment?: (text: string) => void;
	onDeleteComment?: (commentId: string) => void;
	title?: string;
	compact?: boolean;
}

export default function CommentSection({ 
	comments = [], 
	onAddComment, 
	onDeleteComment, 
	title = "Comments",
	compact = false 
}: CommentSectionProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [newComment, setNewComment] = useState('');
	const [collapsed, setCollapsed] = useState(false);

	const handleSubmit = () => {
		if (newComment.trim() && onAddComment) {
			onAddComment(newComment.trim());
			setNewComment('');
			setIsAdding(false);
		}
	};

	const handleCancel = () => {
		setNewComment('');
		setIsAdding(false);
	};

	return (
		<div className={`${compact ? 'mt-2' : 'mt-3'}`}>
			{/* ヘッダー */}
			<div className="flex items-center gap-2 mb-2">
				<IconChat className="w-4 h-4 text-neutral-500" />
				<button
					type="button"
					onClick={() => { if (collapsed) setCollapsed(false); if (!isAdding) setIsAdding(true); }}
					className={`font-medium ${compact ? 'text-xs' : 'text-sm'} text-neutral-700 hover:text-neutral-900 hover:underline rounded px-1`}
				>
					{title} ({comments.length})
				</button>
				<button
					type="button"
					onClick={() => setCollapsed(v => !v)}
					className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
					aria-label={collapsed ? 'Expand comments' : 'Collapse comments'}
				>
					<IconChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`} />
				</button>
			</div>
			
			{!collapsed && (
				<>
					{/* コメント一覧 */}
					{comments.length > 0 && (
						<div className={`space-y-2 ${compact ? 'mb-2' : 'mb-3'}`}>
							{comments.map((comment) => (
								<div key={comment.id} className="bg-neutral-50 rounded-md p-2">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs font-medium text-neutral-700">
													{comment.author}
												</span>
												<span className="text-xs text-neutral-500">
													{comment.timestamp}
												</span>
											</div>
											<p className={`text-neutral-800 ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
												{comment.text}
											</p>
										</div>
										{onDeleteComment && (
											<button
												onClick={() => onDeleteComment(comment.id)}
												className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
											>
												<IconClose className="w-3 h-3" />
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* コメント追加フォーム */}
					{isAdding && (
						<div className="bg-white border border-neutral-200 rounded-md p-3">
							<textarea
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								placeholder="Add a comment..."
								rows={3}
								className="w-full text-sm border-0 resize-none focus:outline-none focus:ring-0 p-0"
								autoFocus
							/>
							<div className="flex items-center justify-end gap-2 mt-2">
								<button
									onClick={handleCancel}
									className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleSubmit}
									disabled={!newComment.trim()}
									className="px-3 py-1.5 text-xs bg-[#00b393] text-white rounded hover:bg-[#00a085] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
								>
									<IconCheck className="w-3 h-3" />
									Add
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
} 