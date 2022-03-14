var fs = require('fs');
var path = require('path');
var FILE = require('./FILE');
/**
 * @param {string} dir
 * @param {string} language
 */
function fromDir(dir, language) {
	var file = path.join(dir, `i18n.${language}.json`);
	var dict = fs.existsSync(file) ?
		Object.assign(
			/** @type {Dictionary} */(JSON.parse(fs.readFileSync(file, 'utf8'))),
			{ [FILE]: file }
		) :
		{};
	if (!fs.existsSync(path.join(dir, "i18n.config.js")))
		dict.__proto__ = fromDir(path.dirname(dir), language);
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
	if (fs.existsSync(_file)) {
		var _dict = dict;
		dict = /** @type {Dictionary} */(JSON.parse(fs.readFileSync(_file, 'utf8')));
		dict.__proto__ = _dict;
		dict[FILE] = _file;
	}
	return dict;
}
module.exports = fromFile;
