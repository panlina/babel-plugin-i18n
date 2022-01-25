var fs = require('fs');
var path = require('path');
var babel = require('@babel/core');
var detectIndent = require('detect-indent');
function generateDictionary(file, language) {
	var dictionaryExists = fs.existsSync(`${file}.i18n.${language}.json`);
	if (dictionaryExists) {
		var indentation = detectIndent(fs.readFileSync(`${file}.i18n.${language}.json`, 'utf8'));
		var trailingWhiteSpaces = fs.readFileSync(`${file}.i18n.${language}.json`, 'utf8').match(/\s*$/);
		// 源代码有错误时要是空操作，所以先把当前字典重命名，parse失败时改回来。
		fs.renameSync(`${file}.i18n.${language}.json`, `${file}.i18n.${language}.json.tmp`);
	}
	try {
		var result = babel.transformFileSync(file, {
			plugins: [require('./analyze')],
			parserOpts: { plugins: ['jsx', 'classProperties', 'typescript'] },
			ast: true,
			code: false,
			babelrc: false
		});
		if (dictionaryExists)
			fs.unlinkSync(`${file}.i18n.${language}.json.tmp`);
	} catch (e) {
		if (dictionaryExists)
			fs.renameSync(`${file}.i18n.${language}.json.tmp`, `${file}.i18n.${language}.json`);
		// 因为`updateDictionary`会调用，`updateDictionary`会代`generateDictionary`在parse失败时恢复字典，
		// 所以返回`true`表示，因为不然`updateDictionary`无法通过`generateDictionary`的执行效果来判断，
		// 因为不生成字典文件也可能是因为字典是空的。
		return true;
	}
	var dictionary = {};
	babel.traverse(result.ast, {
		enter(path) {
			if (path.node.$$i18n && !(path.node.$$i18n.target[language]))
				dictionary[path.node.$$i18n.source] = path.node.$$i18n.source;
		}
	});
	fs.writeFileSync(`${file}.i18n.${language}.json`, JSON.stringify(dictionary, undefined, indentation ? indentation.indent : '\t') + (trailingWhiteSpaces || ''), 'utf8');
	if (!Object.keys(dictionary).length)
		fs.unlinkSync(`${file}.i18n.${language}.json`);
}
var findUp = require('find-up');
var minimatch = require('minimatch');
var glob = require('glob');
function generateDictionaryDirectory(dir, language) {
	var config = require(findUp.sync('i18n.config.js', { cwd: dir }));
	var root = path.dirname(findUp.sync('i18n.config.js', { cwd: dir }));
	var file = glob.sync(path.join(path.relative(root, dir), "**/*"), { ignore: config.exclude, cwd: root });
	var file = minimatch.match(file.map(file => path.resolve(root, file)), path.resolve(root, config.include) || "**/*.{js,jsx,ts,tsx}");
	for (var file of file)
		generateDictionary(file, language);
}
module.exports = function (file, language) {
	if (fs.statSync(file).isDirectory())
		generateDictionaryDirectory(file, language);
	else
		// `generateDictionary`可能返回`true`，原因见上
		return generateDictionary(file, language);
};
