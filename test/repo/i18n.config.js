module.exports = {
	exclude: "exclude.js",
	translator: {
		'en-US': 'dictionary',
		'zh-TW': require('../zhTWTranslator')
	},
	test: require("../containsChinese")
};
