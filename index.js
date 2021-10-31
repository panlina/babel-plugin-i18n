var fs = require('fs');
var path = require('path');
var removeJSXWhitespaces = require("./removeJSXWhitespaces");
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
				if (path.node.$$i18n) return;
				if (!containsChinese(path.node.value)) return;
				path.replaceWith(
					t.callExpression(
						t.identifier('t'),
						[languageExpression, t.stringLiteral(sourceFileName), t.stringLiteral('StringLiteral'), skip(path.node)]
					)
				);
			},
			TemplateLiteral(path) {
				if (!path.node.quasis.some(quasi => containsChinese(quasi.value.cooked))) return;
				path.replaceWith(
					t.callExpression(
						t.identifier('t'),
						[languageExpression, t.stringLiteral(sourceFileName), t.stringLiteral('TemplateLiteral'),
							skip(t.stringLiteral(path.node.quasis.map(quasi => quasi.value.cooked).join("{}"))),
							t.arrayExpression(path.node.expressions)
						]
					)
				);
			},
			JSXElement(path) {
				if (!path.node.children.some(child =>
					child.type == 'JSXText'
					&&
					containsChinese(child.value)
				)) return;
				path.replaceWith(
					t.callExpression(
						t.identifier('t'),
						[languageExpression, t.stringLiteral(sourceFileName), t.stringLiteral('JSXElement'),
							skip(t.stringLiteral(path.node.children.map(child =>
								child.type == 'JSXText' ?
									removeJSXWhitespaces(child.value) :
									"{}"
							).join(''))),
							t.arrayExpression(
								path.node.children
									.filter(child => child.type != 'JSXText')
									.map(child => child.type == 'JSXExpressionContainer' ? child.expression : child)
							)
						]
					)
				);
			}
		}
	};
	function skip(node) {
		node.$$i18n = true;
		return node;
	}
};
function containsChinese(text) {
	return /[\u4e00-\u9fa5]/.test(text);
}
