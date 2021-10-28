var assert = require('assert');
var babel = require("@babel/core");
process.chdir('./test/repo');
it('string literal', function () {
	var result = babel.transformFileSync("./StringLiteral.js", {
		plugins: [require('..')]
	});
	var expected = babel.transformFileSync('./StringLiteral.x.js');
	assert.equal(result.code, expected.code);
});
