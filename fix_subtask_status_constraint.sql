-- 1. 現在のstatusの値を確認
SELECT DISTINCT status, COUNT(*) as count 
FROM sub_tasks 
GROUP BY status;

-- 2. 制約違反している行を確認
SELECT id, title, status 
FROM sub_tasks 
WHERE status NOT IN ('todo', 'active', 'completed');

-- 3. 既存の制約を削除
ALTER TABLE sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_status_check;

-- 4. データを更新（in_progress → active）
UPDATE sub_tasks 
SET status = 'active' 
WHERE status = 'in_progress';

-- 5. 更新後の値を確認
SELECT DISTINCT status, COUNT(*) as count 
FROM sub_tasks 
GROUP BY status;

-- 6. 新しい制約を追加
ALTER TABLE sub_tasks ADD CONSTRAINT sub_tasks_status_check 
CHECK (status IN ('todo', 'active', 'completed'));

-- 7. 制約が正しく追加されたか確認
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'sub_tasks' AND c.contype = 'c'; 