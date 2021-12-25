var fs = require('fs');
var assert = require('assert');
var generateDictionary = require('../generateDictionary');
describe('cli', function () {
	before(function () {
		process.chdir('./test/repo');
	});
	after(function () {
		process.chdir('../..');
	});
	it('generate dictionary', function () {
		generateDictionary('./untranslated.StringLiteral.js', 'en-US');
		try {
			assert.deepEqual(
				JSON.parse(fs.readFileSync('./untranslated.StringLiteral.js.i18n.en-US.json')),
				{ "伐": "伐" }
			);
		} catch (e) {
			throw e;
		} finally {
			fs.unlinkSync('./untranslated.StringLiteral.js.i18n.en-US.json');
		}
	});
});
