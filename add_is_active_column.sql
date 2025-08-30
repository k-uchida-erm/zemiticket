-- parent_tasksテーブルにis_activeカラムを追加
ALTER TABLE parent_tasks ADD COLUMN is_active BOOLEAN DEFAULT FALSE;

-- 既存のレコードを更新（必要に応じて）
-- UPDATE parent_tasks SET is_active = FALSE WHERE is_active IS NULL;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX idx_parent_tasks_is_active ON parent_tasks(is_active); 