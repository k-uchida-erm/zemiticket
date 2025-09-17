-- チケットテーブルに期限カラムを追加（既に存在する場合はスキップ）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tickets' AND column_name = 'due_date') THEN
        ALTER TABLE tickets ADD COLUMN due_date DATE;
    END IF;
END $$;

-- サンプルデータを更新（既存のチケットに期限を設定）
UPDATE tickets
SET due_date = CASE
  -- 観測・測定関連（近い期限）
  WHEN title LIKE '%観測井%' THEN '2025-01-25'::DATE
  WHEN title LIKE '%観測%' THEN '2025-01-30'::DATE
  WHEN title LIKE '%測定%' THEN '2025-01-28'::DATE
  WHEN title LIKE '%モニタリング%' THEN '2025-02-05'::DATE
  WHEN title LIKE '%データ収集%' THEN '2025-01-20'::DATE
  WHEN title LIKE '%データ取得%' THEN '2025-01-22'::DATE

  -- モデル・シミュレーション関連（中程度の期限）
  WHEN title LIKE '%MODFLOW%' THEN '2025-02-15'::DATE
  WHEN title LIKE '%モデル%' THEN '2025-02-20'::DATE
  WHEN title LIKE '%シミュレーション%' THEN '2025-02-25'::DATE
  WHEN title LIKE '%解析%' THEN '2025-02-10'::DATE
  WHEN title LIKE '%水循環%' THEN '2025-02-28'::DATE
  WHEN title LIKE '%水収支%' THEN '2025-02-12'::DATE
  WHEN title LIKE '%感度解析%' THEN '2025-02-18'::DATE
  WHEN title LIKE '%年齢推定%' THEN '2025-02-22'::DATE

  -- システム構築関連（中程度の期限）
  WHEN title LIKE '%システム%' THEN '2025-02-08'::DATE
  WHEN title LIKE '%ネットワーク%' THEN '2025-02-05'::DATE
  WHEN title LIKE '%リアルタイム%' THEN '2025-02-10'::DATE
  WHEN title LIKE '%可視化%' THEN '2025-02-15'::DATE
  WHEN title LIKE '%データベース%' THEN '2025-02-12'::DATE

  -- 汚染・水質関連（近い期限）
  WHEN title LIKE '%汚染%' THEN '2025-01-25'::DATE
  WHEN title LIKE '%水質%' THEN '2025-01-28'::DATE
  WHEN title LIKE '%基準%' THEN '2025-01-30'::DATE

  -- 研究・論文関連（遠い期限）
  WHEN title LIKE '%論文%' THEN '2025-03-15'::DATE
  WHEN title LIKE '%学会%' THEN '2025-03-10'::DATE
  WHEN title LIKE '%発表%' THEN '2025-03-05'::DATE

  -- 準備・調査関連（近い期限）
  WHEN title LIKE '%準備%' THEN '2025-01-20'::DATE
  WHEN title LIKE '%調査%' THEN '2025-01-25'::DATE
  WHEN title LIKE '%文献%' THEN '2025-01-15'::DATE
  WHEN title LIKE '%計画%' THEN '2025-01-18'::DATE
  WHEN title LIKE '%選定%' THEN '2025-01-22'::DATE

  -- 購入・機器関連（近い期限）
  WHEN title LIKE '%購入%' THEN '2025-01-20'::DATE
  WHEN title LIKE '%機器%' THEN '2025-01-25'::DATE
  WHEN title LIKE '%装置%' THEN '2025-01-22'::DATE

  -- 法規・基準関連（近い期限）
  WHEN title LIKE '%法規%' THEN '2025-01-30'::DATE
  WHEN title LIKE '%基準%' THEN '2025-01-28'::DATE

  -- 完了済み（期限なし）
  WHEN status = 'done' THEN NULL

  -- デフォルト
  ELSE '2025-02-15'::DATE
END
WHERE due_date IS NULL;

-- インデックスを追加（期限での検索を高速化）
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(due_date);
