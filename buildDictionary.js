var fs = require('fs');
var glob = require('glob');

module.exports = function () {
	var dictionary = {};
	for (var d of glob.sync("**/{i18n.+([a-zA-Z-]).json,*.i18n.+([a-zA-Z-]).json}"))
		dictionary[d] = JSON.parse(fs.readFileSync(d, 'utf8'));
	return dictionary;
};
