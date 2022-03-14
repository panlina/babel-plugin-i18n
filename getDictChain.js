var fs = require('fs');
var path = require('path');
/**
 * @param {string} dir
 * @param {string} language
 */
function fromDir(dir, language) {
	var file = path.join(dir, `i18n.${language}.json`);
	var dict = fs.existsSync(file) ?
		[file] :
		[];
	if (!fs.existsSync(path.join(dir, "i18n.config.js")))
		dict = [...fromDir(path.dirname(dir), language), ...dict];
	return dict;
}
/**
 * @param {string} file
 * @param {string} language
 */
function fromFile(file, language) {
	var dir = path.dirname(file);
	var dict = fromDir(dir, language);
	var _file = `${file}.i18n.${language}.json`;
	if (fs.existsSync(_file))
		dict = [...dict, _file];
	return dict;
}
module.exports = fromFile;
