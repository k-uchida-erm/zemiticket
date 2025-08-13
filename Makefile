# zemiticket プロジェクト用 Makefile

# .PHONY: 偽のターゲットを宣言。同名のファイルが存在してもコマンドが実行されるようにするおまじない。
.PHONY: up down restart build shell logs clean help

# 'make' とだけ打った時に実行されるデフォルトコマンド
default: help

# ヘルプメッセージを表示
help:
	@echo "Usage: make [command]"
	@echo ""
	@echo "Available commands:"
	@echo "  up        - 開発環境を起動します"
	@echo "  down      - 開発環境を停止します"
	@echo "  restart   - 開発環境を再起動します"
	@echo "  build     - Dockerイメージを再ビルドします"
	@echo "  shell     - 実行中のコンテナ内に入ります"
	@echo "  logs      - 実行中のコンテナのログを表示します"
	@echo "  clean     - node_modules と .next を削除してクリーンな状態にします"


# 開発環境を起動
up:
	docker-compose up -d

# 開発環境を停止
down:
	docker-compose down

# 開発環境を再起動
restart: down up

# Dockerイメージを再ビルド
# Dockerfileを編集した際などに使用
build:
	docker-compose build

# 実行中のコンテナのシェルに入る
# 例: npm install axios を実行したい場合などに便利
shell:
	docker-compose exec app sh

# 実行中のコンテナのログを表示
logs:
	docker-compose logs -f app

# node_modulesと.nextを削除
clean: down
	@echo "Cleaning up node_modules and .next directories..."
	rm -rf node_modules .next
	@echo "Cleanup complete."
