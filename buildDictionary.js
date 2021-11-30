var fs = require('fs');
var glob = require('glob');

module.exports = function (language) {
	var dictionary = {};
	for (var d of glob.sync(`**/{i18n.${language}.json,*.i18n.${language}.json}`))
		dictionary[d] = JSON.parse(fs.readFileSync(d, 'utf8'));
	return dictionary;
};
