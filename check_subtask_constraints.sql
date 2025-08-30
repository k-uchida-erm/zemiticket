-- sub_tasksテーブルのstatusカラムの制約を確認
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'sub_tasks' AND c.contype = 'c';

-- または、より詳細な情報を取得
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'sub_tasks' AND tc.constraint_type = 'CHECK';

-- statusカラムの現在の値を確認
SELECT DISTINCT status FROM sub_tasks; 