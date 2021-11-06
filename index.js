var fs = require('fs');
var path = require('path');
var removeJSXWhitespaces = require("./removeJSXWhitespaces");
module.exports = function ({ types: t }) {
	var config = fs.existsSync("./i18n.config.js") ? require(path.join(process.cwd(), './i18n.config.js')) : {};
	var languageExpression = config.languageExpression(t);
	var sourceFileName;
	var visitor;
	return {
		pre(state) {
			sourceFileName = path.relative(state.opts.root, state.opts.filename);
		},
		visitor: visitor = {
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
							),
							path.node.type == 'JSXFragment' ?
								t.identifier('undefined') :
								getComponentFromNode(path.node.openingElement.name),
							path.node.type == 'JSXFragment' ?
								t.identifier('undefined') :
								t.objectExpression(
									path.node.openingElement.attributes.map(attribute =>
										t.objectProperty(
											t.stringLiteral(attribute.name.name),
											attribute.value ?
												attribute.value.type == 'JSXExpressionContainer' ?
													attribute.value.expression :
													attribute.value :
												t.identifier('undefined')
										)
									)
								)
						]
					)
				);
				function getComponentFromNode(node) {
					if (node.type == 'JSXIdentifier')
						if (node.name.toLowerCase() == node.name)
							return t.stringLiteral(node.name);
						else
							return t.identifier(node.name);
					else if (node.type == 'JSXMemberExpression')
						return t.identifier(`${getComponentFromNode(node.object)}.${getComponentFromNode(node.property)}`);
				}
			},
			JSXFragment(path) {
				visitor.JSXElement.apply(this, arguments);
				path.node.arguments[2].value = 'JSXFragment';
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
