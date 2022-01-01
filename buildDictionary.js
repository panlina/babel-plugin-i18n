var fs = require('fs');
var path = require('path');
var glob = require('glob');

module.exports = function (language) {
	var package = require(path.join(process.cwd(), 'package.json')).name;
	var dictionary = {};
	for (var d of glob.sync(`**/{i18n.${language}.json,*.i18n.${language}.json}`))
		dictionary[`${package}:${d}`] = JSON.parse(fs.readFileSync(d, 'utf8'));
	return dictionary;
};
