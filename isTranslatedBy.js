var path = require('path');
function isTranslatedBy(source, dictionary) {
	var prefix =
		/^i18n\..*\.json$/.test(dictionary) ?
			path.dirname(dictionary) :
			dictionary.substr(0, dictionary.lastIndexOf(".i18n"));
	return source.startsWith(prefix);
}
module.exports = isTranslatedBy;
