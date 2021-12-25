var fs = require('fs');
var path = require('path');
function updateDictionary(file, language) {
	var regenerate = fs.existsSync(`${file}.i18n.${language}.json`);
	if (regenerate)
		fs.renameSync(`${file}.i18n.${language}.json`, `${file}.i18n.${language}.json.tmp`);
	// `generateDictionary`返回`true`表示parse失败，把字典还原回去。
	if (require('./generateDictionary')(file, language)) {
		if (regenerate)
			fs.renameSync(`${file}.i18n.${language}.json.tmp`, `${file}.i18n.${language}.json`);
		return;
	}
	if (regenerate) {
		if (fs.existsSync(`${file}.i18n.${language}.json`))
			require('./translateDictionary')(
				`${file}.i18n.${language}.json`,
				`${file}.i18n.${language}.json.tmp`
			);
		fs.unlinkSync(`${file}.i18n.${language}.json.tmp`);
	}
}
var findUp = require('find-up');
var minimatch = require('minimatch');
var glob = require('glob');
function updateDictionaryDirectory(dir, language) {
	var config = require(findUp.sync('i18n.config.js', { cwd: dir }));
	var root = path.dirname(findUp.sync('i18n.config.js', { cwd: dir }));
	var file = glob.sync(path.join(path.relative(root, dir), "**/*"), { ignore: config.exclude, cwd: root });
	var file = minimatch.match(file.map(file => path.resolve(root, file)), path.resolve(root, config.include) || "**/*.{js,jsx,ts,tsx}");
	for (var file of file)
		updateDictionary(file, language);
}
module.exports = function (file, language) {
	if (fs.statSync(file).isDirectory())
		updateDictionaryDirectory(file, language);
	else
		updateDictionary(file, language);
}
