"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ParentTask, SubTask } from '../../../../types';
import Card from '../../../../components/atoms/Card';
import SectionTitle from '../../../../components/atoms/SectionTitle';
import IconTicket from '../../../../components/atoms/icons/Ticket';
import IconChevronLeft from '../../../../components/atoms/icons/ChevronLeft';
import IconUsers from '../../../../components/atoms/icons/Users';
import IconCalendar from '../../../../components/atoms/icons/Calendar';
import IconCheck from '../../../../components/atoms/icons/Check';

interface ReviewRequestData {
	reviewers: string[];
	dueDate: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	notes: string;
}

export default function ReviewRequestPage() {
	const params = useParams();
	const router = useRouter();
	const slug = params.slug as string;
	
	const [ticketData, setTicketData] = useState<ParentTask | null>(null);
	const [subtasks, setSubtasks] = useState<SubTask[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [formData, setFormData] = useState<ReviewRequestData>({
		reviewers: [],
		dueDate: '',
		priority: 'medium',
		notes: ''
	});

	// チケットデータを取得
	useEffect(() => {
		const fetchTicketData = async () => {
			try {
				setIsLoading(true);
				console.log('Fetching ticket data for slug:', slug);
				
				const response = await fetch('/api/tickets/all');
				if (response.ok) {
					const result = await response.json();
					console.log('API response:', result);
					
					if (result.data) {
						console.log('Data structure:', result.data);
						
						// 全エピックのリストからslugに基づいてチケットを検索
						let foundTicket = null;
						for (const epicGroup of result.data) {
							console.log('Checking epic group:', epicGroup.epic);
							console.log('Epic group list:', epicGroup.list);
							
							// 各リストアイテムの詳細構造を確認
							epicGroup.list.forEach((item: any, index: number) => {
								console.log(`Item ${index} full structure:`, item);
								console.log(`Item ${index} keys:`, Object.keys(item));
								console.log(`Item ${index} parent:`, item.parent);
							});
							
							const ticket = epicGroup.list.find((item: any) => {
								console.log('Checking item:', item.parent?.title, 'slug:', item.parent?.slug, 'target slug:', slug);
								return item.parent?.slug === slug;
							});
							
							if (ticket) {
								console.log('Found ticket:', ticket);
								foundTicket = ticket;
								break;
							}
						}
						
						if (foundTicket) {
							console.log('Setting ticket data:', foundTicket);
							setTicketData(foundTicket.parent);
							setSubtasks(foundTicket.children || []);
						} else {
							console.log('No ticket found for slug:', slug);
							console.log('Available slugs:', result.data.flatMap((group: any) => 
								group.list.map((item: any) => ({ title: item.parent?.title, slug: item.parent?.slug }))
							));
						}
					}
				}
			} catch (error) {
				console.error('Error fetching ticket data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (slug) {
			fetchTicketData();
		}
	}, [slug]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: レビューリクエストの送信処理
		console.log('Review request submitted:', formData);
	};

	const handleBack = () => {
		router.push(`/ticket/${slug}`);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-neutral-600">Loading...</div>
			</div>
		);
	}

	if (!ticketData) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-neutral-600">Ticket not found</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			{/* ヘッダー */}
			<div className="bg-white border-b border-neutral-200 px-6 py-4">
				<div className="flex items-center gap-4">
					<button
						onClick={handleBack}
						className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
					>
						<IconChevronLeft className="w-5 h-5" />
					</button>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center justify-center text-[#00b393] [&_svg]:w-6 [&_svg]:h-6 [&_svg]:stroke-[1.8]">
							<IconTicket />
						</span>
						<h1 className="text-xl font-semibold text-neutral-800">
							Review Request: {ticketData.title}
						</h1>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* メインコンテンツ */}
					<div className="lg:col-span-2 space-y-6">
						{/* レビューリクエストフォーム */}
						<Card className="p-6">
							<SectionTitle icon={<IconUsers />}>Review Request Form</SectionTitle>
							
							<form onSubmit={handleSubmit} className="mt-6 space-y-6">
								{/* レビュアー */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										Reviewers
									</label>
									<select
										multiple
										value={formData.reviewers}
										onChange={(e) => {
											const selected = Array.from(e.target.selectedOptions, option => option.value);
											setFormData(prev => ({ ...prev, reviewers: selected }));
										}}
										className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
									>
										<option value="user1">User 1</option>
										<option value="user2">User 2</option>
										<option value="user3">User 3</option>
									</select>
									<p className="text-xs text-neutral-500 mt-1">
										Hold Ctrl (Cmd on Mac) to select multiple reviewers
									</p>
								</div>

								{/* 期限 */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										Due Date
									</label>
									<input
										type="date"
										value={formData.dueDate}
										onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
										className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
									/>
								</div>

								{/* 優先度 */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										Priority
									</label>
									<select
										value={formData.priority}
										onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
										className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="urgent">Urgent</option>
									</select>
								</div>

								{/* 備考 */}
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										Notes
									</label>
									<textarea
										value={formData.notes}
										onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
										rows={4}
										placeholder="Add any additional notes for reviewers..."
										className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393] resize-none"
									/>
								</div>

								{/* 送信ボタン */}
								<div className="flex justify-end">
									<button
										type="submit"
										className="px-6 py-2 bg-[#00b393] text-white rounded-lg hover:bg-[#00a085] transition-colors font-medium flex items-center gap-2"
									>
										<IconCheck className="w-4 h-4" />
										Submit Review Request
									</button>
								</div>
							</form>
						</Card>
					</div>

					{/* サイドバー */}
					<div className="space-y-6">
						{/* チケット情報 */}
						<Card className="p-6">
							<SectionTitle icon={<IconTicket />}>Ticket Information</SectionTitle>
							
							<div className="mt-4 space-y-3">
								<div className="flex items-center gap-2 text-sm">
									<span className="text-neutral-600">Status:</span>
									<span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs">
										{ticketData.status || 'Not set'}
									</span>
								</div>
								
								{ticketData.due && (
									<div className="flex items-center gap-2 text-sm">
										<IconCalendar className="w-4 h-4 text-neutral-500" />
										<span className="text-neutral-600">Due:</span>
										<span className="text-neutral-800">{ticketData.due}</span>
									</div>
								)}
								
								{ticketData.estimateHours && (
									<div className="flex items-center gap-2 text-sm">
										<span className="text-neutral-600">Estimate:</span>
										<span className="text-neutral-800">{ticketData.estimateHours}h</span>
									</div>
								)}
							</div>
						</Card>

						{/* サブタスク完了状況 */}
						<Card className="p-6">
							<SectionTitle icon={<IconCheck />}>Subtasks Progress</SectionTitle>
							
							<div className="mt-4">
								{/* プログレスバー */}
								<div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
									<div 
										className="h-full bg-[#00b393] transition-all rounded-full"
										style={{ width: `${ticketData.progressPercentage || 0}%` }}
									/>
								</div>
								<div className="text-sm text-neutral-600">
									{ticketData.progressPercentage || 0}% Complete
								</div>
								
								{/* サブタスク一覧 */}
								<div className="mt-4 space-y-2">
									{subtasks.map((subtask) => (
										<div key={subtask.id} className="flex items-center justify-between text-sm">
											<span className="text-neutral-700 truncate">{subtask.title}</span>
											<span className={`px-2 py-1 rounded-full text-xs ${
												subtask.status === 'done' 
													? 'bg-[#00b393] text-white' 
													: subtask.status === 'in_progress'
													? 'bg-orange-100 text-orange-700'
													: 'bg-neutral-100 text-neutral-700'
											}`}>
												{subtask.status || 'todo'}
											</span>
										</div>
									))}
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
} 