"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SectionTitle from '@/components/atoms/SectionTitle';
import IconFlask from '@/components/atoms/icons/Flask';

export default function ResearchPage() {
	const [title, setTitle] = useState('研究プロジェクトの最適化と効率化');
	const [background, setBackground] = useState('現在の研究開発プロセスにおいて、チーム間の連携不足や進捗管理の非効率性が課題となっている。特に、複数のプロジェクトが並行して進行する際のリソース配分や優先度の決定において、意思決定の遅延や重複作業が発生している。\n\n従来の手法では、プロジェクトの進捗状況を正確に把握することが困難で、リスクの早期発見や適切な対応ができていない状況がある。また、研究成果の共有や知識の蓄積においても、体系的な管理ができていないため、同じような問題を繰り返し解決しているケースが見られる。');
	const [goal, setGoal] = useState('本研究の目的は、研究開発プロセスの効率化と品質向上を実現することである。具体的には以下の目標を達成する：\n\n1. プロジェクト間の連携強化により、リソースの最適配分を実現する\n2. 進捗管理の自動化により、意思決定の迅速化を図る\n3. リスク管理の早期化により、プロジェクトの成功率を向上させる\n4. 知識管理システムの構築により、研究成果の蓄積と共有を促進する\n\nこれらの目標の達成により、研究開発の生産性を20%向上させ、プロジェクト完了までの期間を15%短縮することを目指す。');
	const [method, setMethod] = useState('本研究では、以下の手法を用いて研究開発プロセスの最適化を進める：\n\n1. 現状分析：既存のプロジェクト管理手法の課題を洗い出し、改善点を特定する\n2. プロトタイプ開発：新しい管理システムのプロトタイプを作成し、実用性を検証する\n3. パイロット運用：選定されたプロジェクトで新システムを試験運用し、効果を測定する\n4. フィードバック収集：ユーザーからの意見を収集し、システムの改善を継続的に行う\n\n定量的な評価指標として、プロジェクト完了率、リソース利用率、意思決定時間などを設定し、定期的に測定・評価を行う。');
	const [hypothesis, setHypothesis] = useState('本研究では以下の仮説を設定する：\n\n仮説1：プロジェクト間の連携強化により、リソースの重複利用が減少し、全体の効率性が向上する\n仮説2：進捗管理の自動化により、意思決定の迅速化が実現され、プロジェクトの遅延が減少する\n仮説3：リスク管理の早期化により、問題の早期発見・対応が可能となり、プロジェクトの成功率が向上する\n仮説4：知識管理システムの構築により、研究成果の蓄積・共有が促進され、新規プロジェクトの立ち上げが効率化される\n\nこれらの仮説の検証により、研究開発プロセスの最適化手法の有効性を実証する。');

	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({ title, background, goal, method, hypothesis });

	// 編集開始時に元のデータを保存
	const startEditing = () => {
		setOriginalData({ title, background, goal, method, hypothesis });
		setIsEditing(true);
	};

	// 保存
	const handleSave = () => {
		setIsEditing(false);
	};

	// キャンセル
	const handleCancel = () => {
		setTitle(originalData.title);
		setBackground(originalData.background);
		setGoal(originalData.goal);
		setMethod(originalData.method);
		setHypothesis(originalData.hypothesis);
		setIsEditing(false);
	};

	// 編集状態の変更を監視
	useEffect(() => {
		if (title !== originalData.title || background !== originalData.background || 
			goal !== originalData.goal || method !== originalData.method || 
			hypothesis !== originalData.hypothesis) {
			setIsEditing(true);
		}
	}, [title, background, goal, method, hypothesis, originalData]);

	return (
		<div className="px-6 space-y-6">
			{/* Menu Bar */}
			<nav className="flex items-center gap-6 pb-4">
				<button className="text-sm font-medium text-[#00b393] border-b-2 border-[#00b393] pb-2">
					研究設定
				</button>
				<Link href="/epic" className="text-sm font-medium text-neutral-600 hover:text-neutral-800 pb-2 hover:border-b-2 hover:border-neutral-300 transition-all">
					エピック管理
				</Link>
				<button className="text-sm font-medium text-neutral-600 hover:text-neutral-800 pb-2">
					進捗管理
				</button>
				<button className="text-sm font-medium text-neutral-600 hover:text-neutral-800 pb-2">
					成果管理
				</button>
			</nav>

			{/* Save/Cancel Buttons */}
			{isEditing && (
				<div className="flex items-center justify-end gap-2">
					<button onClick={handleCancel} className="px-3 py-1.5 text-[12px] rounded border border-neutral-300 bg-white text-neutral-700">
						キャンセル
					</button>
					<button onClick={handleSave} className="px-3 py-1.5 text-[12px] rounded bg-[#00b393] text-white">
						保存
					</button>
				</div>
			)}

			<section className="space-y-2">
				<div>
					<input 
						value={title} 
						onChange={(e) => setTitle(e.target.value)} 
						placeholder="研究タイトルを入力" 
						className="w-full border-none text-[20px] leading-7 font-semibold text-neutral-900 bg-transparent focus:outline-none focus:ring-0" 
					/>
				</div>
			</section>

			{/* Research Sections with Green Dots and Lines */}
			<div className="relative">
				{/* Background Section */}
				<div className="relative mb-8">
					<div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#00b393] z-10"></div>
					<div className="ml-7">
						<div className="text-sm font-medium text-neutral-600 mb-2">背景</div>
						<div
							contentEditable
							suppressContentEditableWarning
							onInput={(e) => setBackground(e.currentTarget.textContent || '')}
							className="min-h-[5rem] p-2 focus:outline-none focus:ring-0 rounded bg-transparent whitespace-pre-wrap break-words font-sans text-[14px] leading-7 font-medium text-neutral-700"
							style={{ minHeight: '5rem' }}
						>
							{background}
						</div>
					</div>
				</div>

				{/* Goal Section */}
				<div className="relative mb-8">
					<div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#00b393] z-10"></div>
					<div className="ml-7">
						<div className="text-sm font-medium text-neutral-600 mb-2">目的</div>
						<div
							contentEditable
							suppressContentEditableWarning
							onInput={(e) => setGoal(e.currentTarget.textContent || '')}
							className="min-h-[5rem] p-2 focus:outline-none focus:ring-0 rounded bg-transparent whitespace-pre-wrap break-words font-sans text-[14px] leading-7 font-medium text-neutral-700"
							style={{ minHeight: '5rem' }}
						>
							{goal}
						</div>
					</div>
				</div>

				{/* Method Section */}
				<div className="relative mb-8">
					<div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#00b393] z-10"></div>
					<div className="ml-7">
						<div className="text-sm font-medium text-neutral-600 mb-2">方法</div>
						<div
							contentEditable
							suppressContentEditableWarning
							onInput={(e) => setMethod(e.currentTarget.textContent || '')}
							className="min-h-[5rem] p-2 focus:outline-none focus:ring-0 rounded bg-transparent whitespace-pre-wrap break-words font-sans text-[14px] leading-7 font-medium text-neutral-700"
							style={{ minHeight: '5rem' }}
						>
							{method}
						</div>
					</div>
				</div>

				{/* Hypothesis Section */}
				<div className="relative">
					<div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#00b393] z-10"></div>
					<div className="ml-7">
						<div className="text-sm font-medium text-neutral-600 mb-2">仮説</div>
						<div
							contentEditable
							suppressContentEditableWarning
							onInput={(e) => setHypothesis(e.currentTarget.textContent || '')}
							className="min-h-[5rem] p-2 focus:outline-none focus:ring-0 rounded bg-transparent whitespace-pre-wrap break-words font-sans text-[14px] leading-7 font-medium text-neutral-700"
							style={{ minHeight: '5rem' }}
						>
							{hypothesis}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 