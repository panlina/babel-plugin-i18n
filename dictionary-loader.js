var path = require('path');
var findUp = require('find-up');
module.exports = function (source) {
	var root = path.dirname(findUp.sync('i18n.config.js', { cwd: this.resourcePath }));
	var config = require(path.join(root, 'i18n.config.js'), 'utf-8');
	var _path = path.relative(
		root,
		this.resourcePath
	);
	var package = require(findUp.sync('package.json', { cwd: this.resourcePath })).name;
	var [, language] = _path.match(/i18n\.([a-zA-Z-]+)\.json$/);
	return (
		`window["${config.instance}"].translator["${language}"] = window["${config.instance}"].translator["${language}"] || {};`
		+
		`window["${config.instance}"].translator["${language}"].dictionary = window["${config.instance}"].translator["${language}"].dictionary || {};`
		+
		`window["${config.instance}"].translator["${language}"].dictionary["${package}:${_path}"] = ${source};`
	);
};
