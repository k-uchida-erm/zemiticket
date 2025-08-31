// Enforce disabling Lightning CSS for Tailwind/Next during build (Vercel fallback)
if (!process.env.TAILWIND_DISABLE_LIGHTNING) process.env.TAILWIND_DISABLE_LIGHTNING = '1';
if (!process.env.NEXT_DISABLE_LIGHTNINGCSS) process.env.NEXT_DISABLE_LIGHTNINGCSS = '1';

module.exports = {
	plugins: {
		'@tailwindcss/postcss': {},
	},
};
