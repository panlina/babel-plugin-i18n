var path = require('path');
var findUp = require('find-up');
module.exports = function (source) {
	var _path = path.relative(
		path.dirname(findUp.sync('i18n.config.js', { cwd: this.resourcePath })),
		this.resourcePath
	);
	var [, language] = _path.match(/i18n\.([a-zA-Z-]+)\.json$/);
	return (
		`window.i18n.translator["${language}"] = window.i18n.translator["${language}"] || {};`
		+
		`window.i18n.translator["${language}"].dictionary = window.i18n.translator["${language}"].dictionary || {};`
		+
		`window.i18n.translator["${language}"].dictionary["${_path}"] = ${source};`
	);
};
