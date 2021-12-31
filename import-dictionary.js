var path = require('path');
var getDictChain = require('./getDictChain');
var findUp = require('find-up');
var minimatch = require('minimatch');
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
				path.node.body.unshift(
					...Object.values(translation).flatMap(dictionary =>
						dictionary.map(dictionary =>
							t.callExpression(t.identifier('require'), [t.stringLiteral(dictionary)])
						)
					)
				);
				if (skip) path.stop();
			}
		}
	};
};
