-- sub_tasksテーブルのstatusカラムの詳細を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'sub_tasks' AND column_name = 'status';

-- テーブルの制約も確認
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'sub_tasks';

-- サンプルデータも確認
SELECT id, title, status FROM sub_tasks LIMIT 5; 