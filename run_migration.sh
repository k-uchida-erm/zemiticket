#!/bin/bash

# 無限階層チケットシステムへの移行スクリプト

echo "🚀 無限階層チケットシステムへの移行を開始します..."

# 1. 新しいticketsテーブルを作成
echo "📋 新しいticketsテーブルを作成中..."
docker compose exec app psql -U postgres -d zemiticket -f /app/supabase/migrations/20250101000000_create_tickets_table.sql

if [ $? -eq 0 ]; then
    echo "✅ ticketsテーブルの作成が完了しました"
else
    echo "❌ ticketsテーブルの作成に失敗しました"
    exit 1
fi

# 2. 既存データを移行
echo "🔄 既存データを移行中..."
docker compose exec app psql -U postgres -d zemiticket -f /app/supabase/migrations/20250101000001_migrate_existing_data.sql

if [ $? -eq 0 ]; then
    echo "✅ データ移行が完了しました"
else
    echo "❌ データ移行に失敗しました"
    exit 1
fi

# 3. 移行結果を確認
echo "🔍 移行結果を確認中..."
docker compose exec app psql -U postgres -d zemiticket -c "
SELECT 
  'tickets (level 0)' as table_name,
  COUNT(*) as count
FROM tickets 
WHERE level = 0

UNION ALL

SELECT 
  'tickets (level 1)' as table_name,
  COUNT(*) as count
FROM tickets 
WHERE level = 1

UNION ALL

SELECT 
  'todos with ticket_id' as table_name,
  COUNT(*) as count
FROM todos 
WHERE ticket_id IS NOT NULL;
"

echo "🎉 移行が完了しました！"
echo "📊 新しいticketsテーブルで無限階層のチケット管理が可能になりました"
