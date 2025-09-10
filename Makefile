# zemiticket プロジェクト - Makefile
# Docker環境での開発を簡単にするためのコマンド集

.PHONY: help install up down build start stop restart logs shell test test-watch test-coverage test-e2e test-e2e-ui test-e2e-debug lint lint-fix format format-check clean reset

# デフォルトターゲット
help:
	@echo "zemiticket プロジェクト - 利用可能なコマンド:"
	@echo ""
	@echo "開発環境:"
	@echo "  make up          - 開発環境を起動 (docker compose up -d)"
	@echo "  make down        - 開発環境を停止 (docker compose down)"
	@echo "  make restart     - 開発環境を再起動"
	@echo "  make logs        - ログを表示"
	@echo "  make shell       - アプリコンテナにシェル接続"
	@echo ""
	@echo "ビルド・実行:"
	@echo "  make build       - アプリケーションをビルド"
	@echo "  make start       - 本番モードで起動"
	@echo "  make stop        - アプリケーションを停止"
	@echo ""
	@echo "テスト:"
	@echo "  make test        - ユニットテスト実行"
	@echo "  make test-watch  - ウォッチモードでテスト実行"
	@echo "  make test-coverage - カバレッジ付きテスト実行"
	@echo "  make test-e2e    - E2Eテスト実行"
	@echo "  make test-e2e-ui - UIモードでE2Eテスト実行"
	@echo "  make test-e2e-debug - デバッグモードでE2Eテスト実行"
	@echo ""
	@echo "コード品質:"
	@echo "  make lint        - ESLintチェック"
	@echo "  make lint-fix    - ESLint自動修正"
	@echo "  make format      - Prettierでフォーマット"
	@echo "  make format-check - フォーマットチェック"
	@echo ""
	@echo "メンテナンス:"
	@echo "  make clean       - ビルドファイルとキャッシュを削除"
	@echo "  make reset       - 完全リセット（データベース含む）"
	@echo "  make install     - 依存関係をインストール"
	@echo ""
	@echo "ヘルプ:"
	@echo "  make help        - このヘルプを表示"

# 開発環境の起動
up:
	@echo "🚀 開発環境を起動中..."
	docker compose up -d
	@echo "✅ 開発環境が起動しました！"
	@echo "🌐 アプリケーション: http://localhost:3000"
	@echo "📊 Supabase Studio: http://localhost:54323"

# 開発環境の停止
down:
	@echo "🛑 開発環境を停止中..."
	docker compose down
	@echo "✅ 開発環境が停止しました"

# 開発環境の再起動
restart: down up

# ログの表示
logs:
	@echo "📋 ログを表示中..."
	docker compose logs -f app

# アプリコンテナにシェル接続
shell:
	@echo "🐚 アプリコンテナにシェル接続中..."
	docker compose exec app /bin/bash

# アプリケーションのビルド
build:
	@echo "🔨 アプリケーションをビルド中..."
	docker compose exec app npm run build
	@echo "✅ ビルドが完了しました"

# 本番モードで起動
start:
	@echo "🚀 本番モードで起動中..."
	docker compose exec app npm run start

# アプリケーションの停止
stop:
	@echo "🛑 アプリケーションを停止中..."
	docker compose exec app pkill -f "next start" || true

# ユニットテスト実行
test:
	@echo "🧪 ユニットテストを実行中..."
	docker compose exec app npm test
	@echo "✅ テストが完了しました"

# ウォッチモードでテスト実行
test-watch:
	@echo "👀 ウォッチモードでテストを実行中..."
	docker compose exec app npm run test:watch

# カバレッジ付きテスト実行
test-coverage:
	@echo "📊 カバレッジ付きテストを実行中..."
	docker compose exec app npm run test:coverage
	@echo "✅ カバレッジテストが完了しました"

# E2Eテスト実行
test-e2e:
	@echo "🌐 E2Eテストを実行中..."
	docker compose exec app npm run test:e2e
	@echo "✅ E2Eテストが完了しました"

# UIモードでE2Eテスト実行
test-e2e-ui:
	@echo "🖥️ UIモードでE2Eテストを実行中..."
	docker compose exec app npm run test:e2e:ui

# デバッグモードでE2Eテスト実行
test-e2e-debug:
	@echo "🐛 デバッグモードでE2Eテストを実行中..."
	docker compose exec app npm run test:e2e:debug

# ESLintチェック
lint:
	@echo "🔍 ESLintチェックを実行中..."
	docker compose exec app npm run lint
	@echo "✅ ESLintチェックが完了しました"

# ESLint自動修正
lint-fix:
	@echo "🔧 ESLint自動修正を実行中..."
	docker compose exec app npm run lint:fix
	@echo "✅ ESLint自動修正が完了しました"

# Prettierでフォーマット
format:
	@echo "✨ Prettierでフォーマット中..."
	docker compose exec app npm run format
	@echo "✅ フォーマットが完了しました"

# フォーマットチェック
format-check:
	@echo "🔍 フォーマットチェックを実行中..."
	docker compose exec app npm run format:check
	@echo "✅ フォーマットチェックが完了しました"

# ビルドファイルとキャッシュを削除
clean:
	@echo "🧹 ビルドファイルとキャッシュを削除中..."
	docker compose exec app rm -rf .next
	docker compose exec app rm -rf node_modules/.cache
	docker compose exec app rm -rf coverage
	@echo "✅ クリーンアップが完了しました"

# 完全リセット（データベース含む）
reset:
	@echo "⚠️  完全リセットを実行中（データベース含む）..."
	@read -p "本当に実行しますか？ (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v
	docker compose up -d
	@echo "✅ 完全リセットが完了しました"

# 依存関係をインストール
install:
	@echo "📦 依存関係をインストール中..."
	docker compose exec app npm install
	@echo "✅ 依存関係のインストールが完了しました"

# 開発環境の状態確認
status:
	@echo "📊 開発環境の状態を確認中..."
	docker compose ps
	@echo ""
	@echo "🌐 アプリケーション: http://localhost:3000"
	@echo "📊 Supabase Studio: http://localhost:54323"

# データベースの状態確認
db-status:
	@echo "🗄️ データベースの状態を確認中..."
	docker compose exec app npx supabase status || true

# データベースのリセット
db-reset:
	@echo "🔄 データベースをリセット中..."
	docker compose exec app npx supabase db reset
	@echo "✅ データベースのリセットが完了しました"

# 依存関係の更新
update-deps:
	@echo "🔄 依存関係を更新中..."
	docker compose exec app npm update
	@echo "✅ 依存関係の更新が完了しました"

# セキュリティ監査
audit:
	@echo "🔒 セキュリティ監査を実行中..."
	docker compose exec app npm audit
	@echo "✅ セキュリティ監査が完了しました"

# セキュリティ修正
audit-fix:
	@echo "🔧 セキュリティ修正を実行中..."
	docker compose exec app npm audit fix
	@echo "✅ セキュリティ修正が完了しました"

# パッケージの脆弱性チェック
vulnerability-check:
	@echo "🚨 パッケージの脆弱性をチェック中..."
	docker compose exec app npm audit --audit-level=moderate
	@echo "✅ 脆弱性チェックが完了しました"

# 開発環境のヘルスチェック
health-check:
	@echo "🏥 開発環境のヘルスチェックを実行中..."
	@echo "1. Dockerコンテナの状態確認..."
	docker compose ps
	@echo ""
	@echo "2. アプリケーションの応答確認..."
	@curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "アプリケーションが応答していません"
	@echo ""
	@echo "3. Supabaseの状態確認..."
	@curl -s -o /dev/null -w "Supabase Status: %{http_code}\n" http://localhost:54323 || echo "Supabaseが応答していません"
	@echo ""
	@echo "✅ ヘルスチェックが完了しました"

# 開発環境の完全セットアップ
setup: up install
	@echo "🎉 開発環境のセットアップが完了しました！"
	@echo "🌐 アプリケーション: http://localhost:3000"
	@echo "📊 Supabase Studio: http://localhost:54323"
	@echo "🐚 シェル接続: make shell"
	@echo "🧪 テスト実行: make test"
	@echo "🔍 リンティング: make lint"
