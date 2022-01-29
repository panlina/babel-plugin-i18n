var fs = require('fs');
var path = require('path');
var findUp = require('find-up');
var glob = require('glob');
function validateDictionary(file) {
	var dictionary = JSON.parse(fs.readFileSync(file, 'utf8'));
	var diagnostic = [];
	for (var [key, value] of Object.entries(dictionary))
		if (value == key)
			diagnostic.push({ type: 'no-change', key: key, file: file });
		else if (checkCapture(key, value))
			diagnostic.push({ type: 'capture-index', key: key, file: file });
		else if (checkCaptureIndexOutOfBounds(key, value))
			diagnostic.push({ type: 'capture-index-out-of-bounds', key: key, file: file });
	return diagnostic;
	/** 检查是不是没有用序号引用变量，只在变量多于一个时检查) */
	function checkCapture(key, value) {
		var captureCount = key.split('{}').length - 1;
		if (captureCount <= 1) return;
		var components = value.split(/(?<!\\)\{((?:[^\\}]|\\\\|\\\})*)(?<!\\)\}/);
		var [, expressions] = partitionEvenOdd(components);
		if (expressions.every(expression => isNaN(parseInt(expression))))
			return true;
	}
	function checkCaptureIndexOutOfBounds(key, value) {
		var captureCount = key.split('{}').length - 1;
		var components = value.split(/(?<!\\)\{((?:[^\\}]|\\\\|\\\})*)(?<!\\)\}/);
		var [, expressions] = partitionEvenOdd(components);
		if (expressions.some(expression => (parseInt(expression) || 0) >= captureCount))
			return true;
	}
}
function validateDictionaryDirectory(dir, language) {
	var root = path.dirname(findUp.sync('i18n.config.js', { cwd: dir }));
	var file = glob.sync(path.join(path.relative(root, dir), `**/*i18n.${language}.json`), { cwd: root });
	var diagnostic = file.map(validateDictionary);
	var diagnostic = [].concat.apply([], diagnostic);
	return diagnostic;
}
module.exports = function (file, language) {
	if (fs.statSync(file).isDirectory())
		var diagnostic = validateDictionaryDirectory(file, language);
	else
		var diagnostic = validateDictionary(file);
	return diagnostic;
};
function partitionEvenOdd(a) {
	var even = [], odd = [];
	for (var i in a)
		(i & 1 ? odd : even).push(a[i]);
	return [even, odd];
}
