var fs = require('fs');
var path = require('path');
module.exports = function ({ types: t }) {
	var config = fs.existsSync("./i18n.config.js") ? require(path.join(process.cwd(), './i18n.config.js')) : {};
	var languageExpression = config.languageExpression(t);
	var sourceFileName;
	return {
		pre(state) {
			sourceFileName = path.relative(state.opts.root, state.opts.filename);
		},
		visitor: {
			StringLiteral(path) {
				if (!containsChinese(path.node.value)) return;
				path.replaceWith(
					t.callExpression(
						t.identifier('t'),
						[languageExpression, t.stringLiteral(sourceFileName), path.node]
					)
				);
				path.skip();
			}
		}
	};
};
function containsChinese(text) {
	return /[\u4e00-\u9fa5]/.test(text);
}
