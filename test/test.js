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
it('template literal', function () {
	var result = babel.transformFileSync("./TemplateLiteral.js", {
		plugins: [require('..')],
		generatorOpts: { jsescOption: { minimal: true } }
	});
	var expected = babel.transformFileSync('./TemplateLiteral.x.js');
	assert.equal(result.code, expected.code);
});
it('jsx element', function () {
	var result = babel.transformFileSync("./JSXElement.js", {
		plugins: [require('..')],
		parserOpts: { plugins: ['jsx'] },
		generatorOpts: { jsescOption: { minimal: true } }
	});
	var expected = babel.transformFileSync('./JSXElement.x.js', { parserOpts: { plugins: ['jsx'] } });
	assert.equal(result.code, expected.code);
});
