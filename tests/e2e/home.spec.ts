import { expect, test } from '@playwright/test';

test.describe('ホームページのテスト', () => {
	test.beforeEach(async ({ page }) => {
		// 各テストの前にホームページにアクセス
		await page.goto('/');
	});

	test('ホームページが正しく表示される', async ({ page }) => {
		// ページタイトルが正しく表示される
		await expect(page).toHaveTitle(/zemiticket/);

		// アクティブチケットセクションが表示される
		await expect(page.locator('text=Active Tickets')).toBeVisible();
	});

	test('アクティブチケットが表示される', async ({ page }) => {
		// アクティブチケットのセクションが存在する
		const activeTicketsSection = page.locator(
			'section:has-text("Active Tickets")'
		);
		await expect(activeTicketsSection).toBeVisible();

		// チケットが表示される（少なくとも1つは存在する）
		const tickets = page.locator('[data-testid="ticket-card"], .ticket-card');
		await expect(tickets.first()).toBeVisible();
	});

	test('チケットの詳細情報が表示される', async ({ page }) => {
		// チケットカードが表示される
		const ticketCard = page
			.locator('[data-testid="ticket-card"], .ticket-card')
			.first();
		await expect(ticketCard).toBeVisible();

		// チケットのタイトルが表示される
		await expect(ticketCard.locator('h3, .title')).toBeVisible();

		// 進捗バーが表示される
		await expect(
			ticketCard.locator('.progress-bar, [role="progressbar"]')
		).toBeVisible();
	});

	test('レスポンシブデザインが動作する', async ({ page }) => {
		// デスクトップ表示
		await page.setViewportSize({ width: 1280, height: 720 });
		await expect(page.locator('text=Active Tickets')).toBeVisible();

		// モバイル表示
		await page.setViewportSize({ width: 375, height: 667 });
		await expect(page.locator('text=Active Tickets')).toBeVisible();
	});
});
