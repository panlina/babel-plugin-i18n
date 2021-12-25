var fs = require('fs');
var detectIndent = require('detect-indent');
function translateDictionary(source, dictionary) {
	var s = JSON.parse(fs.readFileSync(source, 'utf8'));
	var t = JSON.parse(fs.readFileSync(dictionary, 'utf8'));
	var indentation = detectIndent(fs.readFileSync(dictionary, 'utf8'));
	var trailingWhiteSpaces = fs.readFileSync(dictionary, 'utf8').match(/\s*$/);
	for (let source in s)
		if (source in t)
			s[source] = t[source];
	fs.writeFileSync(source, JSON.stringify(s, undefined, indentation.indent) + trailingWhiteSpaces, 'utf8');
}
module.exports = translateDictionary;
