# ZemiTicket - ホーム画面UI仕様書

## 概要

ZemiTicketは、研究・開発プロジェクトのタスク管理を行うWebアプリケーションです。ホーム画面では、アクティブなタスクの状況を一目で把握できるよう、複数のセクションに分けて情報を表示しています。

## ホーム画面のレイアウト構造

### 全体レイアウト
ホーム画面は5カラムのグリッドレイアウトを採用しており、左側のメインコンテンツエリア（3カラム）と右側のサイドバー（2カラム）で構成されています。

```
┌─────────────────────────────────────────────────────────────┐
│                   ヘッダー                                  │
├─────────────────────────────────────────────────────────────┤
│ メインコンテンツ (3カラム)    │    サイドバー (2カラム)    │
│                              │                            │
│ • アクティブチケットボード    │   • レビュー中チケット      │
│ • 他ユーザーのアクティブ      │                            │
│   チケット                   │                            │
│                              │                            │
└─────────────────────────────────────────────────────────────┘
```

## セクション詳細

### 1. アクティブチケットボード (ActiveTicketsBoard)
**位置**: メインコンテンツエリアの最上部  
**コンポーネント**: `ActiveTicketsBoard`  
**表示内容**: 
- 現在進行中の親タスク（ParentTask）とその子タスク（SubTask）をグループ化して表示
- 各親タスクには進捗率、期限、優先度、担当者などの情報を表示
- 子タスクはチェックボックス付きで完了状況を管理

**データ構造**:
```typescript
{
  parent: ParentTask,      // 親タスク情報
  children: SubTask[]      // 子タスクの配列
}[]
```

### 2. 他ユーザーのアクティブチケット (Others Active Tickets)
**位置**: メインコンテンツエリアの中央  
**コンポーネント**: `OthersActiveRow`  
**表示内容**:
- 自分以外のユーザーが担当しているアクティブなタスク
- ユーザー別にグループ化して表示
- 各タスクの進捗状況と期限を表示

**アイコン**: ユーザーアイコン（`IconUser`）  
**色**: アンバー（amber）バリアント

### 3. レビュー中チケット (In Review Tickets)
**位置**: 右サイドバー  
**コンポーネント**: `SubmittedTicketCard`  
**表示内容**:
- レビュー待ちまたはレビュー中のチケット
- レビューコメントと決定状況
- 修正が必要な箇所の詳細

**アイコン**: リストアイコン（`IconList`）  
**色**: インディゴ（indigo）バリアント

## データモデル

### ParentTask（親タスク）
```typescript
{
  id: number,                    // タスクID
  title: string,                 // タスクタイトル
  user: string,                  // 担当者名
  due: string,                   // 期限（YYYY-MM-DD形式）
  progressPercentage: number,    // 進捗率（0-100）
  description: string,           // タスクの詳細説明
  slug: string,                  // URLスラッグ
  status: string,                // ステータス
  priority: string,              // 優先度
  commentsCount: number,         // コメント数
  updatedAt: string,             // 最終更新日時
  estimateHours: number,         // 推定工数（時間）
  epic: string                   // エピック名
}
```

### SubTask（子タスク）
```typescript
{
  id: number,                    // サブタスクID
  title: string,                 // サブタスクタイトル
  user: string,                  // 担当者名
  due: string,                   // 期限
  done: boolean,                 // 完了フラグ
  description: string,           // 説明
  slug: string,                  // URLスラッグ
  status: string,                // ステータス
  priority: string,              // 優先度
  commentsCount: number,         // コメント数
  updatedAt: string,             // 最終更新日時
  estimateHours: number,         // 推定工数
  todos: Todo[]                  // 詳細なTODOリスト
}
```

### Todo（詳細タスク）
```typescript
{
  id: number,                    // TODO ID
  title: string,                 // TODOタイトル
  done: boolean,                 // 完了フラグ
  estimateHours: number,         // 推定工数
  inProgress?: boolean           // 進行中フラグ（オプション）
}
```

## コンポーネント構成

### 原子コンポーネント (Atoms)
- `SectionTitle`: セクションのタイトル表示
- `Avatar`: ユーザーアバター
- `Badge`: ステータスや優先度の表示
- `Card`: カード形式のコンテナ
- `ProgressBar`: 進捗率の表示
- `StatusDot`: ステータスインジケーター

### 分子コンポーネント (Molecules)
- `ParentTicketCard`: 親タスクのカード表示
- `SubTicketCard`: 子タスクのカード表示
- `SubmittedTicketCard`: レビュー中チケットのカード表示
- `OthersActiveRow`: 他ユーザーのアクティブタスク行
- `TaskCard`: タスクの基本カード

### 有機体コンポーネント (Organisms)
- `ActiveTicketsBoard`: アクティブチケットのボード表示
- `TicketKanban`: カンバンボード形式の表示
- `TicketTree`: タスクの階層構造表示

## レスポンシブデザイン

- **デスクトップ**: 5カラムグリッド（メイン3カラム + サイドバー2カラム）
- **モバイル**: 1カラム表示に変更
- **タブレット**: 中間サイズでの最適化

## カラーテーマ

- **アンバー**: 他ユーザーのアクティブタスクセクション
- **インディゴ**: レビュー中チケットセクション
- **ニュートラル**: ボーダーや背景色

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **アーキテクチャ**: Atomic Design（原子・分子・有機体・テンプレート・ページ）

## 今後の拡張予定

- ドラッグ&ドロップによるタスクの並び替え
- リアルタイム更新機能
- フィルタリング・ソート機能
- ダークモード対応
- モバイルアプリ対応
