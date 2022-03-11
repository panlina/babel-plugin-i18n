var path = require('path');
var getDictChain = require('./getDictChain');
var findUp = require('find-up');
var minimatch = require('minimatch');
/**
 * @param {import("@babel/core")} babel
 * @returns {import("@babel/core").PluginObj}
 */
module.exports = function ({ types: t }) {
	var translation = {};
	var config;
	var skip;
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
					translation[language] = getDictChain(state.opts.filename, language);
		},
		visitor: {
			Program(path) {
				if (skip) { path.stop(); return; }
				// The empty statement is a workaround for the issue that,
				// when working with webpack,
				// the inserted require statements will be generated without trailing semicolons,
				// so when the source code begins with an open parenthesis, it will be interpreted as a function call.
				// 
				// Like:
				// 
				// /* 0 */
				// /***/ (function(module, exports, __webpack_require__) {
				//
				// __webpack_require__(1)
				// 
				// (function () {
				// 	...
				// })();
				// 
				// No github issue or stackoverflow answer found yet.
				path.node.body.unshift(t.emptyStatement());
				for (var language in translation) {
					var dictionary = translation[language];
					path.node.body.unshift(
						...dictionary.map(dictionary =>
							t.callExpression(t.identifier('require'), [t.stringLiteral(dictionary)])
						)
					);
				}
			}
		}
	};
};
