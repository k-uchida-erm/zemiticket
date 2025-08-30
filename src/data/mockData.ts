import { ParentTask, SubTask } from '../types';

// モックデータ（開発・テスト用）
// 本番環境ではDBから取得したデータを使用

export const mockActiveGroups: { parent: ParentTask; children: SubTask[] }[] = [
  {
    parent: {
      id: '1',
      title: '実験プロトコルv2の確定',
      user: '田中 太郎',
      due: '2025-05-30',
      progressPercentage: 40,
      description: 'プロトコルの最終版を策定し、全員に共有。装置設定とサンプル処理の標準化を含む。',
      slug: 'protocol-v2-finalize',
      status: 'in_progress',
      priority: 'high',
      commentsCount: 3,
      updatedAt: '2d ago',
      estimateHours: 12,
      epic: 'プロトコルv2',
    },
    children: [
      { 
        id: '11', 
        title: '前処理スクリプトの整理', 
        user: '佐藤 花子', 
        due: '2025-05-15', 
        done: true, 
        description: '不要関数の削除と共通化', 
        slug: 'cleanup-preprocess', 
        status: 'done', 
        priority: 'medium', 
        commentsCount: 1, 
        updatedAt: '1d ago', 
        estimateHours: 2, 
        todos: [
          { id: '111', title: '不要関数の削除', done: true, estimateHours: 0.5 },
          { id: '112', title: '共通ユーティリティ化', done: true, estimateHours: 1.5 },
        ] 
      },
      { 
        id: '12', 
        title: '装置Aのキャリブレーション', 
        user: '鈴木 次郎', 
        due: '2025-05-20', 
        done: false, 
        description: '温度ドリフトの補正', 
        slug: 'calibrate-device-a', 
        status: 'in_progress', 
        priority: 'urgent', 
        commentsCount: 2, 
        updatedAt: '3h ago', 
        estimateHours: 3, 
        todos: [
          { id: '121', title: '温度センサー初期化', done: true, estimateHours: 0.5 },
          { id: '122', title: '基準サンプル測定', done: false, estimateHours: 1 },
          { id: '123', title: 'ドリフト補正適用', done: false, estimateHours: 1.5 },
        ] 
      },
      { 
        id: '13', 
        title: '検証データの取得(week2)', 
        user: '田中 太郎', 
        due: '2025-05-22', 
        done: false, 
        description: '10サンプル x 3回測定', 
        slug: 'collect-week2-data', 
        status: 'todo', 
        priority: 'high', 
        commentsCount: 0, 
        updatedAt: '5h ago', 
        estimateHours: 4, 
        todos: [
          { id: '131', title: 'サンプル準備', done: false, estimateHours: 1 },
          { id: '132', title: '測定プロトコル確認', done: false, estimateHours: 0.5 },
          { id: '133', title: '測定実施', done: false, estimateHours: 2.5 },
        ] 
      },
    ],
  },
  {
    parent: {
      id: '2',
      title: '論文ドラフト(導入/関連研究)改稿',
      user: '高橋 美咲',
      due: '2025-06-05',
      progressPercentage: 60,
      description: 'レビューコメントを反映し、構成を簡潔に整理する。引用の最新化も行う。',
      slug: 'paper-draft-revise-intro-related',
      status: 'review',
      priority: 'medium',
      commentsCount: 4,
      updatedAt: '6h ago',
      estimateHours: 16,
      epic: '論文ドラフト',
    },
    children: [
      { 
        id: '21', 
        title: '引用箇所の再確認', 
        user: '高橋 美咲', 
        due: '2025-05-25', 
        done: true, 
        description: '2019年以降の文献のみ', 
        slug: 'crosscheck-citations', 
        status: 'done', 
        priority: 'low', 
        commentsCount: 2, 
        updatedAt: '1d ago', 
        estimateHours: 1, 
        todos: [
          { id: '211', title: '新規文献収集', done: true, estimateHours: 0.5 },
          { id: '212', title: '重複・古い引用の整理', done: true, estimateHours: 0.5 },
        ] 
      },
      { 
        id: '22', 
        title: '章構成レビュー反映', 
        user: '田中 太郎', 
        due: '2025-05-28', 
        done: false, 
        description: '導入の重複を削除', 
        slug: 'apply-structure-feedback', 
        status: 'in_progress', 
        priority: 'medium', 
        commentsCount: 1, 
        updatedAt: '2h ago', 
        estimateHours: 2, 
        todos: [
          { id: '221', title: '導入の重複箇所抽出', done: true, estimateHours: 0.5 },
          { id: '222', title: '関連研究の段落再配置', done: false, estimateHours: 1 },
          { id: '223', title: '整合性チェック', done: false, estimateHours: 0.5 },
        ] 
      },
    ],
  },
];

export const mockSubmittingTickets: Array<ParentTask & { children?: SubTask[] }> = [
  {
    id: '101',
    title: '進捗レポート(5月第2週)',
    user: '田中 太郎',
    due: '2025-05-14',
    description: '週次の要点を1ページにまとめる',
    slug: 'weekly-report-w2',
    status: 'review',
    priority: 'medium',
    commentsCount: 2,
    updatedAt: '1h ago',
    estimateHours: 12,
    reviewDecision: 'pending',
    reviewComments: [
      { author: '教授', text: '図2の凡例をわかりやすく。' },
      { author: '教授', text: '結論の定量指標を追加。' }
    ],
    epic: 'レポート',
    children: [
      { 
        id: '1011', 
        title: '図2の注釈を改善', 
        user: '田中 太郎', 
        due: '2025-05-13', 
        done: false, 
        description: '注釈のラベルと位置見直し', 
        slug: 'improve-fig2-legend', 
        status: 'in_progress', 
        priority: 'medium', 
        commentsCount: 0, 
        updatedAt: '1h ago', 
        estimateHours: 1.5, 
        todos: [
          { id: '10111', title: 'ラベル文言の候補出し', done: true, estimateHours: 0.5 },
          { id: '10112', title: '凡例の配置調整', done: false, estimateHours: 0.5, inProgress: true },
          { id: '10113', title: '見た目の最終確認', done: false, estimateHours: 0.5 }
        ]
      },
      { 
        id: '1012', 
        title: '定量指標の追記', 
        user: '田中 太郎', 
        due: '2025-05-14', 
        done: false, 
        description: '精度/再現率/F1を追加', 
        slug: 'add-metrics', 
        status: 'todo', 
        priority: 'high', 
        commentsCount: 0, 
        updatedAt: '30m ago', 
        estimateHours: 2, 
        todos: [
          { id: '10121', title: '評価スクリプト実行', done: false, estimateHours: 0.8 },
          { id: '10122', title: '結果の表/図作成', done: false, estimateHours: 0.7 },
          { id: '10123', title: '本文への反映', done: false, estimateHours: 0.5 }
        ]
      }
    ]
  },
  {
    id: '102',
    title: '実験計画(シリーズB)',
    user: '佐藤 花子',
    due: '2025-05-18',
    description: '被験者条件と手順の見直し',
    slug: 'exp-plan-series-b',
    status: 'in_progress',
    priority: 'high',
    commentsCount: 5,
    updatedAt: '4h ago',
    estimateHours: 8,
    reviewDecision: 'rework',
    reviewComments: [
      { author: '教授', text: '倫理手続きの追記が必要。' }
    ],
    epic: '倫理・手順',
    children: [
      { 
        id: '1021', 
        title: '倫理手続きの章追加', 
        user: '佐藤 花子', 
        due: '2025-05-17', 
        done: false, 
        description: 'IRB番号と手順追記', 
        slug: 'irb-section-add', 
        status: 'in_progress', 
        priority: 'urgent', 
        commentsCount: 1, 
        updatedAt: '2h ago', 
        estimateHours: 1.5, 
        todos: [
          { id: '10211', title: 'IRB番号の確認', done: true, estimateHours: 0.3 },
          { id: '10212', title: '手順の素案作成', done: false, estimateHours: 0.7, inProgress: true },
          { id: '10213', title: '表現の統一', done: false, estimateHours: 0.5 }
        ]
      },
      { 
        id: '1022', 
        title: '被験者条件の再定義', 
        user: '佐藤 花子', 
        due: '2025-05-18', 
        done: false, 
        description: '年齢/性別/健康状態', 
        slug: 'redefine-criteria', 
        status: 'todo', 
        priority: 'high', 
        commentsCount: 0, 
        updatedAt: '1h ago', 
        estimateHours: 1.2, 
        todos: [
          { id: '10221', title: '既存条件の棚卸し', done: false, estimateHours: 0.4 },
          { id: '10222', title: '修正案の作成', done: false, estimateHours: 0.6 },
          { id: '10223', title: '指導教員レビュー準備', done: false, estimateHours: 0.2 }
        ]
      }
    ]
  },
];

export const mockOthersActiveParents: Array<ParentTask & { children: SubTask[] }> = [
  {
    id: '201',
    title: '評価実験(被験者募集・日程)',
    user: '山本 蓮',
    due: '2025-05-26',
    description: '内部募集メールの文面作成',
    slug: 'eval-recruiting',
    status: 'in_progress',
    priority: 'medium',
    commentsCount: 0,
    updatedAt: '2d ago',
    estimateHours: 6,
    epic: '評価実験',
    children: [
      { 
        id: '2011', 
        title: '募集フォームの作成', 
        user: '山本 蓮', 
        due: '2025-05-18', 
        done: true, 
        description: 'Google Formで作成', 
        slug: 'recruit-form-build', 
        status: 'done', 
        priority: 'low', 
        commentsCount: 0, 
        updatedAt: '3d ago', 
        estimateHours: 1,
        todos: [
          { id: '20111', title: '設問設計', done: true, estimateHours: 0.3 },
          { id: '20112', title: '同意文面記載', done: true, estimateHours: 0.4 },
        ]
      },
      { 
        id: '2012', 
        title: '募集メール文面の草案', 
        user: '山本 蓮', 
        due: '2025-05-19', 
        done: false, 
        description: '対象/謝礼/日程/同意', 
        slug: 'recruit-mail-draft', 
        status: 'in_progress', 
        priority: 'medium', 
        commentsCount: 1, 
        updatedAt: '1d ago', 
        estimateHours: 2,
        todos: [
          { id: '20121', title: 'トーン&マナー決定', done: true, estimateHours: 0.5 },
          { id: '20122', title: '本文初稿', done: false, estimateHours: 1.0, inProgress: true },
          { id: '20123', title: '件名・前文の最適化', done: false, estimateHours: 0.5 },
        ]
      },
      { 
        id: '2013', 
        title: '教授レビュー反映', 
        user: '山本 蓮', 
        due: '2025-05-21', 
        done: false, 
        description: '文面のトーン調整', 
        slug: 'apply-prof-review', 
        status: 'todo', 
        priority: 'low', 
        commentsCount: 0, 
        updatedAt: '10h ago', 
        estimateHours: 1,
        todos: [
          { id: '20131', title: '指摘箇所の抜き出し', done: false, estimateHours: 0.4 },
          { id: '20132', title: '修正反映', done: false, estimateHours: 0.6 },
        ]
      },
    ],
  },
  {
    id: '202',
    title: 'データクレンジング基準の策定',
    user: '山田 純',
    due: '2025-06-01',
    description: '外れ値処理と欠損補完',
    slug: 'data-cleansing-policy',
    status: 'todo',
    priority: 'high',
    commentsCount: 3,
    updatedAt: '3d ago',
    estimateHours: 10,
    epic: 'データ基盤',
    children: [
      { 
        id: '2021', 
        title: '現状データの品質評価', 
        user: '山田 純', 
        due: '2025-05-22', 
        done: false, 
        description: '欠損/外れ値の分布確認', 
        slug: 'current-quality-audit', 
        status: 'in_progress', 
        priority: 'medium', 
        commentsCount: 0, 
        updatedAt: '6h ago', 
        estimateHours: 3,
        todos: [
          { id: '20211', title: '欠損率の集計', done: false, estimateHours: 1, inProgress: true },
          { id: '20212', title: '外れ値しきい値案', done: false, estimateHours: 1 },
          { id: '20213', title: 'レポート草案', done: false, estimateHours: 1 },
        ]
      },
      { 
        id: '2022', 
        title: '補完戦略の比較表作成', 
        user: '山田 純', 
        due: '2025-05-25', 
        done: false, 
        description: '平均/中央値/kNN/回帰', 
        slug: 'imputation-comparison', 
        status: 'todo', 
        priority: 'medium', 
        commentsCount: 0, 
        updatedAt: '6h ago', 
        estimateHours: 2,
        todos: [
          { id: '20221', title: '指標選定', done: false, estimateHours: 0.5 },
          { id: '20222', title: '各手法の結果入力', done: false, estimateHours: 1 },
          { id: '20223', title: '最終表の体裁調整', done: false, estimateHours: 0.5 },
        ]
      },
    ],
  },
];

export const mockOthersGrouped = [
  { user: '山本 蓮', tickets: [mockOthersActiveParents[0]] },
  { user: '山田 純', tickets: [mockOthersActiveParents[1]] },
]; 

// Tickets page mock data
export const ticketsPageMockData = {
	parents: [
		{
			epic: 'プロトコルv2',
			parent: { id: '1', title: '実験プロトコルv2の確定', user: '田中 太郎', due: '2025-05-30', progressPercentage: 40, description: 'プロトコルの最終版を策定し、全員に共有。', slug: 'protocol-v2-finalize', status: 'in_progress', priority: 'high', commentsCount: 3, updatedAt: '2d ago', estimateHours: 12, epic: 'プロトコルv2' },
			children: [
				{ id: '11', title: '前処理スクリプトの整理', user: '佐藤 花子', due: '2025-05-15', done: true, description: '不要関数の削除と共通化', slug: 'cleanup-preprocess', status: 'done', priority: 'medium', commentsCount: 1, updatedAt: '1d ago', estimateHours: 2, todos: [
					{ id: '111', title: '不要関数の削除', done: true, estimateHours: 0.5 },
					{ id: '112', title: '共通ユーティリティ化', done: true, estimateHours: 1.5 },
				] },
				{ id: '12', title: '装置Aのキャリブレーション', user: '鈴木 次郎', due: '2025-05-20', done: false, description: '温度ドリフトの補正', slug: 'calibrate-device-a', status: 'in_progress', priority: 'urgent', commentsCount: 2, updatedAt: '3h ago', estimateHours: 3, todos: [
					{ id: '121', title: '温度センサー初期化', done: true, estimateHours: 0.5 },
					{ id: '122', title: '基準サンプル測定', done: false, estimateHours: 1 },
					{ id: '123', title: 'ドリフト補正適用', done: false, estimateHours: 1.5 },
				] },
			],
		},
		{
			epic: '論文ドラフト',
			parent: { id: '2', title: '論文ドラフト(導入/関連研究)改稿', user: '高橋 美咲', due: '2025-06-05', progressPercentage: 60, description: 'レビューコメントを反映し、構成を簡潔に整理する。', slug: 'paper-draft-revise-intro-related', status: 'review', priority: 'medium', commentsCount: 4, updatedAt: '6h ago', estimateHours: 16, epic: '論文ドラフト' },
			children: [
				{ id: '21', title: '引用箇所の再確認', user: '高橋 美咲', due: '2025-05-25', done: true, description: '2019年以降の文献のみ', slug: 'crosscheck-citations', status: 'done', priority: 'low', commentsCount: 2, updatedAt: '1d ago', estimateHours: 1, todos: [
					{ id: '211', title: '新規文献収集', done: true, estimateHours: 0.5 },
					{ id: '212', title: '重複・古い引用の整理', done: true, estimateHours: 0.5 },
				] },
				{ id: '22', title: '章構成レビュー反映', user: '田中 太郎', due: '2025-05-28', done: false, description: '導入の重複を削除', slug: 'apply-structure-feedback', status: 'in_progress', priority: 'medium', commentsCount: 1, updatedAt: '2h ago', estimateHours: 2, todos: [
					{ id: '221', title: '導入の重複箇所抽出', done: true, estimateHours: 0.5 },
					{ id: '222', title: '関連研究の段落再配置', done: false, estimateHours: 1 },
					{ id: '223', title: '整合性チェック', done: false, estimateHours: 0.5 },
				] },
			],
		},
	]
}; 
 
 
 
 
 
 
 