import type { NextConfig } from 'next';

// 強制的にLightning CSSを無効化（Vercel上で環境変数が届かない場合の保険）
if (!process.env.NEXT_DISABLE_LIGHTNINGCSS) {
	process.env.NEXT_DISABLE_LIGHTNINGCSS = '1';
}
if (!process.env.TAILWIND_DISABLE_LIGHTNING) {
	process.env.TAILWIND_DISABLE_LIGHTNING = '1';
}

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		optimizeCss: false,
	},
};

export default nextConfig;
