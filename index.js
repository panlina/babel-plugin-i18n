var fs = require('fs');
var path = require('path');
var findUp = require('find-up');
var minimatch = require('minimatch');
var abstract = require('./abstract');
var reduceStringLiteralExpressions = require('./reduceStringLiteralExpressions');
module.exports = function ({ types: t }) {
	var config = fs.existsSync("./i18n.config.js") ? require(path.join(process.cwd(), './i18n.config.js')) : {};
	var sourceFileName;
	var package;
	var skipProgram;
	var explicit;
	var visitor;
	return {
		pre(state) {
			sourceFileName = path.relative(state.opts.root, state.opts.filename);
			package = require(findUp.sync('package.json', { cwd: state.opts.filename })).name;
			skipProgram = false;
			explicit = config.explicit || false;
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
			DirectiveLiteral(path) {
				if (path.node.value == "i18n.explicit")
					explicit = true;
				else if (path.node.value == "i18n.implicit")
					explicit = false;
			},
			StringLiteral(path) {
				if (explicit) {
					if (!path.node["$$i18n.take"]) return;
				} else {
					if (path.node["$$i18n.skip"]) return;
					if (!config.test(path.node.value)) return;
				}
				var node =
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[
							t.memberExpression(t.identifier('i18n'), t.identifier('language')),
							nontext(t.stringLiteral(`${package}:${sourceFileName}`)),
							path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) : t.identifier('undefined'),
							nontext(t.stringLiteral('StringLiteral')),
							nontext(t.stringLiteral(abstract(path.node)))
						]
					);
				if (path.parent.type == 'JSXAttribute')
					node = { type: 'JSXExpressionContainer', expression: node };
				path.replaceWith(node);
			},
			TemplateLiteral(path) {
				if (explicit) {
					if (!path.node["$$i18n.take"]) return;
				} else {
					if (!path.node.quasis.some(quasi => config.test(quasi.value.cooked))) return;
				}
				path.replaceWith(
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[
							t.memberExpression(t.identifier('i18n'), t.identifier('language')),
							nontext(t.stringLiteral(`${package}:${sourceFileName}`)),
							path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) : t.identifier('undefined'),
							nontext(t.stringLiteral('TemplateLiteral')),
							nontext(t.stringLiteral(abstract(path.node))),
							t.arrayExpression(path.node.expressions)
						]
					)
				);
			},
			JSXElement(path) {
				if (explicit) {
					if (!path.node["$$i18n.take"]) return;
				} else {
					if (!path.node.children.some(child =>
						child.type == 'JSXText'
						&&
						config.test(child.value)
					)) return;
				}
				path.replaceWith(
					t.callExpression(
						t.memberExpression(t.identifier('i18n'), t.identifier('t')),
						[
							t.memberExpression(t.identifier('i18n'), t.identifier('language')),
							nontext(t.stringLiteral(`${package}:${sourceFileName}`)),
							path.node['$$i18n.key'] ? t.stringLiteral(path.node['$$i18n.key']) : t.identifier('undefined'),
							nontext(t.stringLiteral(path.node.type)),
							nontext(t.stringLiteral(abstract(path.node))),
							t.arrayExpression(
								reduceStringLiteralExpressions(path.node.children)
									.filter(child => child.type != 'JSXText' && (child.type != 'JSXExpressionContainer' || child.expression.type != 'JSXEmptyExpression'))
									.map(child => child.type == 'JSXExpressionContainer' ? child.expression : child)
							),
							path.node.type == 'JSXFragment' ?
								t.identifier('undefined') :
								getComponentFromNode(path.node.openingElement.name),
							path.node.type == 'JSXFragment' ?
								t.identifier('undefined') :
								t.objectExpression(
									path.node.openingElement.attributes.map(attribute =>
										t.isJSXSpreadAttribute(attribute) ?
											t.spreadElement(attribute.argument) :
											t.objectProperty(
												t.stringLiteral(attribute.name.name),
												attribute.value ?
													attribute.value.type == 'JSXExpressionContainer' ?
														attribute.value.expression :
														attribute.value :
													t.booleanLiteral(true)
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
			},
			JSXFragment(path) {
				visitor.JSXElement.apply(this, arguments);
			},
			SequenceExpression(path) {
				if (!explicit) {
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
			},
			CallExpression(path) {
				if (explicit)
					if (path.node.callee.name == 'i18n')
						path.replaceWith(take(
							path.node.arguments.length <= 1 ?
								path.node.arguments[0] :
								key(path.node.arguments[1], path.node.arguments[0].value)
						));
			}
		}
	};
	function nontext(node) {
		return explicit ? node : skip(node);
	}
	function skip(node) {
		node["$$i18n.skip"] = true;
		return node;
	}
	function take(node) {
		node["$$i18n.take"] = true;
		return node;
	}
	function key(node, key) {
		node["$$i18n.key"] = key;
		return node;
	}
};
