-- sub_tasksテーブルにstatusカラムを追加
ALTER TABLE sub_tasks ADD COLUMN status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'active', 'completed'));

-- 既存のレコードを更新（必要に応じて）
-- UPDATE sub_tasks SET status = 'todo' WHERE status IS NULL;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX idx_sub_tasks_status ON sub_tasks(status); 