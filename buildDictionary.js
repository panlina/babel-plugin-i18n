var fs = require('fs');
var glob = require('glob');

module.exports = function () {
	var dictionary = {};
	for (var d of glob.sync("**/*.i18n.json"))
		dictionary[d] = JSON.parse(fs.readFileSync(d, 'utf8'));
	return dictionary;
};
