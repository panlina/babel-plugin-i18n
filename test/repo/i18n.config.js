module.exports = {
	exclude: "exclude.js",
	languageExpression(t) {
		return t.memberExpression(
			t.identifier('localStorage'),
			t.identifier('language')
		);
	},
	language: {
		'en-US': 'dictionary',
		'zh-TW': 'translator'
	}
};
