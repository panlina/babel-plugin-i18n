var fs = require('fs');
var path = require('path');
var minimatch = require('minimatch');
var removeJSXWhitespaces = require("./removeJSXWhitespaces");
module.exports = function ({ types: t }) {
	var config = fs.existsSync("./i18n.config.js") ? require(path.join(process.cwd(), './i18n.config.js')) : {};
	var sourceFileName;
	var skipProgram;
	var visitor;
	return {
		pre(state) {
			sourceFileName = path.relative(state.opts.root, state.opts.filename);
			skipProgram = false;
			if (
				!minimatch(sourceFileName, config.include || "**/*.{js,jsx,ts,tsx}")
				||
				minimatch(sourceFileName, config.exclude || "{}")
			) {
				skipProgram = true;
				return;
			}
		},
		visitor: visitor = {
			Program(path) {
				if (skipProgram) path.stop();
			},
			StringLiteral(path) {
				if (path.node.$$i18n) return;
				if (!containsChinese(path.node.value)) return;
				var node =
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[t.memberExpression(t.identifier('i18n'), t.identifier('language')), skip(t.stringLiteral(sourceFileName)), t.stringLiteral('StringLiteral'), skip(path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) : t.stringLiteral(escape(path.node.value)))]
					);
				if (path.parent.type == 'JSXAttribute')
					node = { type: 'JSXExpressionContainer', expression: node };
				path.replaceWith(node);
			},
			TemplateLiteral(path) {
				if (!path.node.quasis.some(quasi => containsChinese(quasi.value.cooked))) return;
				path.replaceWith(
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[t.memberExpression(t.identifier('i18n'), t.identifier('language')), skip(t.stringLiteral(sourceFileName)), t.stringLiteral('TemplateLiteral'),
							skip(
								path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) :
									t.stringLiteral(path.node.quasis.map(quasi => escape(quasi.value.cooked)).join("{}"))
							),
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
				reduceStringLiteralExpressions(path.node);
				path.replaceWith(
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[t.memberExpression(t.identifier('i18n'), t.identifier('language')), skip(t.stringLiteral(sourceFileName)),
							t.stringLiteral(path.node.type),
							skip(
								path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) :
									t.stringLiteral(path.node.children.map(child =>
										child.type == 'JSXText' ?
											escape(removeJSXWhitespaces(child.value)) :
											"{}"
									).join(''))
							),
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
						return t.identifier(`${getComponentFromNode(node.object).name}.${getComponentFromNode(node.property).name}`);
				}
				function reduceStringLiteralExpressions(node) {
					for (var i in node.children) {
						var child = node.children[i];
						if (
							child.type == 'JSXExpressionContainer' &&
							child.expression.type == 'StringLiteral' &&
							child.expression.value == ' '
						)
							node.children[i] = t.jsxText(child.expression.value);
					}
					return node;
				}
			},
			JSXFragment(path) {
				visitor.JSXElement.apply(this, arguments);
			},
			SequenceExpression(path) {
				var expressions = path.node.expressions;
				if (
					expressions.length == 2
					&&
					expressions[0].type == 'StringLiteral'
					&&
					expressions[0].value == 'i18n.ignore'
				)
					path.skip();
				if (
					expressions.length == 2
					&&
					expressions[0].type == 'StringLiteral'
					&&
					expressions[0].value.startsWith('i18n:')
				)
					path.replaceWith(
						key(expressions[1], expressions[0].value.substr('i18n:'.length))
					);
			}
		}
	};
	function skip(node) {
		node.$$i18n = true;
		return node;
	}
	function key(node, key) {
		node["$$i18n.key"] = key;
		return node;
	}
	function escape(text) {
		return text.replace(/([\\{}])/g, "\\$1");
	}
};
function containsChinese(text) {
	return /[\u4e00-\u9fa5]/.test(text);
}
