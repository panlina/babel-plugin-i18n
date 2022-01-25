var fs = require('fs');
var path = require('path');
var babel = require('@babel/core');
function generateReport(file, language) {
	try {
		var result = babel.transformFileSync(file, {
			plugins: [require('./analyze')],
			parserOpts: { plugins: ['jsx', 'classProperties', 'typescript'] },
			ast: true,
			code: false,
			babelrc: false
		});
	} catch (e) {
		console.error(e.message);
		return;
	}
	if (!result) return;
	var m = 0, n = 0;
	babel.traverse(result.ast, {
		enter(path) {
			if (path.node.$$i18n) {
				n++;
				if (path.node.$$i18n.target[language])
					m++;
			}
		}
	});
	return [m, n];
}
var findUp = require('find-up');
var minimatch = require('minimatch');
var glob = require('glob');
function generateReportDirectory(dir, language) {
	var config = require(findUp.sync('i18n.config.js', { cwd: dir }));
	var root = path.dirname(findUp.sync('i18n.config.js', { cwd: dir }));
	var file = glob.sync(path.join(path.relative(root, dir), "**/*"), { ignore: config.exclude, cwd: root });
	var file = minimatch.match(file.map(file => path.resolve(root, file)), path.resolve(root, config.include) || "**/*.{js,jsx,ts,tsx}");
	var report = file.map(file => generateReport(file, language));
	var sum = report.reduce(([m, n], [o, p]) => [m + o, n + p], [0, 0]);
	return sum;
}
module.exports = function (file, language) {
	if (fs.statSync(file).isDirectory())
		var [m, n] = generateReportDirectory(file, language);
	else
		var [m, n] = generateReport(file, language);
	return [m, n];
};
