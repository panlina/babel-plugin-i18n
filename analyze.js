var path = require('path');
var buildDict = require('./buildDict');
var abstract = require('./abstract');
var lookup = require('./lookup');
var findUp = require('find-up');
var minimatch = require('minimatch');
/**
 * @param {import("@babel/core")} babel
 * @returns {import("@babel/core").PluginObj}
 */
module.exports = function ({ types: t }) {
	var SKIP = Symbol('skip');
	/** @type {{ [language: string]: Dictionary }}*/
	var translation = {};
	/** @type {Config} */
	var config;
	/** @type {boolean} */
	var skip;
	/** @type {import("@babel/core").PluginObj["visitor"]} */
	var visitor;
	return {
		pre(state) {
			config = require(findUp.sync('i18n.config.js', { cwd: state.opts.filename }));
			skip = false;
			var dir = path.dirname(findUp.sync('i18n.config.js', { cwd: state.opts.filename }));
			if (
				!minimatch(state.opts.filename, path.join(dir, config.include || "**/*.{js,jsx,ts,tsx}"))
				||
				minimatch(state.opts.filename, path.join(dir, config.exclude || "{}"))
			) {
				skip = true;
				return;
			}
			for (var language in config.translator)
				if (config.translator[language] == 'dictionary')
					translation[language] = buildDict(state.opts.filename, language);
		},
		visitor: visitor = {
			Program(path) {
				if (skip) path.stop();
			},
			StringLiteral(path) {
				if (path.node[SKIP]) return;
				if (!config.test(path.node.value)) return;
				var source = abstract(path.node);
				path.node.$$i18n = {
					source: source,
					target: Object.keys(config.translator).reduce(
						(target, language) => (
							target[language] =
								config.translator[language] == 'dictionary' ?
									lookup(translation[language], source) :
									config.translator[language](source),
							target
						),
						{}
					)
				};
			},
			TemplateLiteral(path) {
				if (!path.node.quasis.some(quasi => config.test(quasi.value.cooked))) return;
				var source = abstract(path.node);
				path.node.quasis.forEach(quasi => { quasi[SKIP] = true; });
				path.node.$$i18n = {
					source: source,
					target: Object.keys(config.translator).reduce(
						(target, language) => (
							target[language] =
								config.translator[language] == 'dictionary' ?
									lookup(translation[language], source) :
									config.translator[language](source),
							target
						),
						{}
					)
				};
			},
			JSXElement(path) {
				if (!path.node.children.some(child =>
					child.type == 'JSXText'
					&&
					config.test(child.value)
				)) return;
				var source = abstract(path.node);
				path.node.children.forEach(child => {
					if (child.type == 'JSXText')
						child[SKIP] = true;
				});
				path.node.$$i18n = {
					source: source,
					target: Object.keys(config.translator).reduce(
						(target, language) => (
							target[language] =
								config.translator[language] == 'dictionary' ?
									lookup(translation[language], source) :
									config.translator[language](source),
							target
						),
						{}
					)
				};
			},
			JSXFragment() {
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
			}
		}
	};
};
