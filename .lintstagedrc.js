module.exports = {
	// TypeScriptとJavaScriptファイル
	'*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
	// その他のファイル
	'*.{json,md,yml,yaml,css,scss,html}': ['prettier --write'],
};
