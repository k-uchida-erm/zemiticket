"use client";

import { useState } from 'react';
import SectionTitle from '../../components/atoms/SectionTitle';
import IconFlask from '../../components/atoms/icons/Flask';
import ExampleChip from '../../components/atoms/ExampleChip';
import SubHeader from '../../components/molecules/SubHeader';

export default function ResearchSettingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'notes'>('overview');

  const [background, setBackground] = useState('');
  const [goal, setGoal] = useState('');
  const [epics, setEpics] = useState<string[]>([]);
  const [parents, setParents] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <SubHeader
        items={[
          { key: 'overview', label: 'Overview' },
          { key: 'structure', label: 'Structure' },
          { key: 'notes', label: 'Notes' },
        ]}
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as any)}
      />

      <SectionTitle icon={<IconFlask />}>Research settings</SectionTitle>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <GuideCard
            title="0. 研究の背景"
            prompt="あなたの研究は何の問題を解こうとしていますか？対象・課題・制約を1-2文で。"
            value={background}
            onChange={setBackground}
            examples={["高齢者の転倒検知が遅れる問題を、ウェアラブル端末の加速度データから早期に検出する。","熟練者の設計知見の形式知化が難しい課題に対し、生成AIで設計プロセスを支援する。"]}
          />

          <GuideCard
            title="1. 研究のゴール"
            prompt="1年後に何を達成していれば成功と言えますか？測定可能な成果で書いてみましょう。"
            value={goal}
            onChange={setGoal}
            examples={["国際会議1本採択","実運用可能なプロトタイプの完成・内部評価でF1 0.8以上"]}
          />
        </div>
      )}

      {activeTab === 'structure' && (
        <div className="space-y-6">
          <ListGuideCard
            title="2. チェックポイント（エピック）"
            prompt="ゴールに向けた重要な通過点を3-5個、順序付きで。"
            items={epics}
            setItems={setEpics}
            suggestions={["要件定義完了","プロトタイプv1完成","予備実験完了","本実験完了","論文ドラフト完成"]}
          />

          <ListGuideCard
            title="3. 親タスク（チェックポイントに紐づく）"
            prompt="各チェックポイントに到達するための大きめのタスクを列挙。1項目1タスク。"
            items={parents}
            setItems={setParents}
            suggestions={["データ収集プロトコル策定","モデルアーキテクチャ設計","評価指標設計","ユーザスタディ計画"]}
          />

          <ListGuideCard
            title="4. サブタスク（親タスクを分解）"
            prompt="親タスクを2-5個の手順に分けて、実行可能な粒度で。"
            items={subtasks}
            setItems={setSubtasks}
            suggestions={["参考実装の調査","既存データセットでベースライン実装","ハイパラ探索の設計","失敗例の分析"]}
          />
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-3 text-[12px] text-neutral-700">
          <p>研究上のメモや前提、依存関係、担当、スケジュール上の注意点などを書き留めてください。</p>
          <textarea className="w-full border border-neutral-300 p-2 h-56" placeholder="メモを書いてください..." />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button className="text-[12px] px-3 py-1.5 border border-neutral-300">プレビュー</button>
        <button className="text-[12px] px-3 py-1.5 border border-neutral-300 bg-neutral-900 text-white">保存</button>
      </div>
    </div>
  );
}

function GuideCard({ title, prompt, value, onChange, examples }: { title: string; prompt: string; value: string; onChange: (v: string) => void; examples: string[] }) {
  return (
    <div className="border border-neutral-200 p-3 space-y-2">
      <div className="text-[13px] font-medium text-neutral-800">{title}</div>
      <p className="text-[12px] text-neutral-600">{prompt}</p>
      <div className="flex flex-wrap gap-1">
        {examples.map((ex) => (
          <ExampleChip key={ex} text={ex} onClick={(t) => onChange(t)} />
        ))}
      </div>
      <textarea className="w-full border border-neutral-300 p-2 text-[12px] h-28" value={value} onChange={(e) => onChange(e.target.value)} placeholder="ここに入力..." />
    </div>
  );
}

function ListGuideCard({ title, prompt, items, setItems, suggestions }: { title: string; prompt: string; items: string[]; setItems: (v: string[]) => void; suggestions: string[] }) {
  const [draft, setDraft] = useState('');
  const addItem = () => {
    if (!draft.trim()) return;
    setItems([...(items || []), draft.trim()]);
    setDraft('');
  };
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const applySuggestion = (text: string) => setDraft(text);

  return (
    <div className="border border-neutral-200 p-3 space-y-2">
      <div className="text-[13px] font-medium text-neutral-800">{title}</div>
      <p className="text-[12px] text-neutral-600">{prompt}</p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((ex) => (
          <ExampleChip key={ex} text={ex} onClick={applySuggestion} />
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border border-neutral-300 px-2 py-1 text-[12px]" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="入力して追加" />
        <button className="text-[12px] px-2.5 py-1 border border-neutral-300" onClick={addItem}>追加</button>
      </div>
      <ul className="text-[12px] text-neutral-800">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between border-b border-neutral-200 py-1">
            <span className="truncate">{item}</span>
            <button className="text-[11px] px-2 py-0.5 border border-neutral-300" onClick={() => remove(idx)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 