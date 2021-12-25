var validateDictionary = require('./validateDictionary');
var diagnosticMessage = require('./diagnosticMessage');
module.exports = function (file, language) {
	var diagnostic = validateDictionary(file, language);
	for (var { type, key, file } of diagnostic)
		console.warn(`${diagnosticMessage[type]}(${type}): ${file} ${key}`);
};
