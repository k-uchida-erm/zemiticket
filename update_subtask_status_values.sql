-- sub_tasksテーブルのstatus値を看板ボード用に更新
-- in_progress → active に変更
UPDATE sub_tasks 
SET status = 'active' 
WHERE status = 'in_progress';

-- 確認用：更新後の値を確認
SELECT id, title, status FROM sub_tasks LIMIT 10;

-- 必要に応じて、特定のサブタスクのstatusを変更
-- UPDATE sub_tasks SET status = 'completed' WHERE id = '39ee1e20-002e-4af3-bd73-a9e26fddbb7c'; 