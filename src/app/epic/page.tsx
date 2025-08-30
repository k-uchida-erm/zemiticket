"use client";

import { useState } from "react";
import Card from "@/components/atoms/Card";
import SectionTitle from "@/components/atoms/SectionTitle";
import IconTicket from "@/components/atoms/icons/Ticket";

export default function EpicPage() {
  const [epicTitle, setEpicTitle] = useState("");
  const [epicDescription, setEpicDescription] = useState("");
  const [epicPriority, setEpicPriority] = useState("medium");
  const [epicStatus, setEpicStatus] = useState("planning");
  const [epicStartDate, setEpicStartDate] = useState("");
  const [epicEndDate, setEpicEndDate] = useState("");
  const [epicTags, setEpicTags] = useState("");
  const [epicDependencies, setEpicDependencies] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: エピックの保存処理を実装
    console.log("エピック保存:", {
      title: epicTitle,
      description: epicDescription,
      priority: epicPriority,
      status: epicStatus,
      startDate: epicStartDate,
      endDate: epicEndDate,
      tags: epicTags,
      dependencies: epicDependencies,
    });
  };

  const priorityOptions = [
    { value: "low", label: "低", color: "bg-blue-100 text-blue-800" },
    { value: "medium", label: "中", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "高", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "緊急", color: "bg-red-100 text-red-800" },
  ];

  const statusOptions = [
    { value: "planning", label: "計画中", color: "bg-gray-100 text-gray-800" },
    { value: "active", label: "進行中", color: "bg-green-100 text-green-800" },
    { value: "review", label: "レビュー中", color: "bg-purple-100 text-purple-800" },
    { value: "completed", label: "完了", color: "bg-blue-100 text-blue-800" },
    { value: "on-hold", label: "保留", color: "bg-yellow-100 text-yellow-800" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">エピック管理</h1>
        <span className="px-2 py-1 bg-[#00b393] text-white text-xs font-medium rounded-full">管理</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* エピック作成フォーム */}
        <div className="lg:col-span-2">
          <Card>
            <SectionTitle icon={<IconTicket />}>エピック作成</SectionTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  エピックタイトル *
                </label>
                <input
                  type="text"
                  value={epicTitle}
                  onChange={(e) => setEpicTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  placeholder="エピックのタイトルを入力"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  説明
                </label>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setEpicDescription(e.currentTarget.textContent || '')}
                  className="min-h-[5rem] p-2 focus:outline-none focus:ring-0 rounded bg-transparent whitespace-pre-wrap break-words font-sans text-[14px] leading-7 font-medium text-neutral-700 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  style={{ minHeight: '5rem' }}
                >
                  {epicDescription}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    優先度
                  </label>
                  <select
                    value={epicPriority}
                    onChange={(e) => setEpicPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    ステータス
                  </label>
                  <select
                    value={epicStatus}
                    onChange={(e) => setEpicStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    開始日
                  </label>
                  <input
                    type="date"
                    value={epicStartDate}
                    onChange={(e) => setEpicStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    完了予定日
                  </label>
                  <input
                    type="date"
                    value={epicEndDate}
                    onChange={(e) => setEpicEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  タグ
                </label>
                <input
                  type="text"
                  value={epicTags}
                  onChange={(e) => setEpicTags(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  placeholder="カンマ区切りでタグを入力（例: フロントエンド, UI/UX, パフォーマンス）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  依存関係
                </label>
                <input
                  type="text"
                  value={epicDependencies}
                  onChange={(e) => setEpicDependencies(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b393]/20 focus:border-[#00b393]"
                  placeholder="依存するエピックやチケットのIDを入力"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00b393] text-white rounded-lg hover:bg-[#00a085] transition-colors font-medium"
                >
                  エピックを作成
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-6">
          <Card>
            <SectionTitle icon={<IconTicket />}>エピック概要</SectionTitle>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">総エピック数</span>
                <span className="text-lg font-semibold text-neutral-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">進行中</span>
                <span className="text-lg font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">完了</span>
                <span className="text-lg font-semibold text-blue-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">保留中</span>
                <span className="text-lg font-semibold text-yellow-600">0</span>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<IconTicket />}>最近のエピック</SectionTitle>
            <div className="text-sm text-neutral-500 text-center py-4">
              まだエピックが作成されていません
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<IconTicket />}>クイックアクション</SectionTitle>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-left">
                📊 エピック一覧を表示
              </button>
              <button className="w-full px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-left">
                📅 カレンダービュー
              </button>
              <button className="w-full px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-left">
                📈 進捗レポート
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 