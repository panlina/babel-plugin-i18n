var assert = require('assert');
var babel = require("@babel/core");
describe('analyze', function () {
	before(function () {
		process.chdir('./test/repo');
	});
	after(function () {
		process.chdir('../..');
	});
	it('string literal', function () {
		var result = babel.transformFileSync("./StringLiteral.js", {
			plugins: [require('../analyze')],
			ast: true,
			code: false
		});
		var expression = result.ast.program.body[0].expression;
		assert.deepEqual(expression['$$i18n'], {
			source: "确定",
			target: {
				'en-US': ['OK', require('./repo/i18n.en-US.json')],
				'zh-TW': require('chinese-conv').tify("确定")
			}
		});
	});
	it('template literal', function () {
		var result = babel.transformFileSync("./TemplateLiteral.js", {
			plugins: [require('../analyze')],
			ast: true,
			code: false
		});
		var expression = result.ast.program.body[0].expression;
		assert.deepEqual(expression['$$i18n'], {
			source: "你好，{}！",
			target: {
				'en-US': ['Hello, {}!', require('./repo/i18n.en-US.json')],
				'zh-TW': require('chinese-conv').tify("你好，{0}！")
			}
		});
	});
	it('jsx element', function () {
		var result = babel.transformFileSync("./JSXElement.js", {
			plugins: [require('../analyze')],
			parserOpts: { plugins: ['jsx'] },
			ast: true,
			code: false
		});
		var expression = result.ast.program.body[0].expression;
		assert.deepEqual(expression['$$i18n'], {
			source: "{}新建",
			target: {
				'en-US': ['{}New', require('./repo/i18n.en-US.json')],
				'zh-TW': require('chinese-conv').tify("{0}新建")
			}
		});
	});
	describe('escape', function () {
		it('string literal', function () {
			var result = babel.transformFileSync("./escape.StringLiteral.js", {
				plugins: [require('../analyze')],
				ast: true,
				code: false
			});
			var expression = result.ast.program.body[0].expression;
			assert.deepEqual(expression['$$i18n'], {
				source: "不能包含以下字符：\\\\()[]\\{\\}",
				target: {
					'en-US': ["Cannot contain following characters: \\\\()[]\\{\\}", require('./repo/escape.StringLiteral.js.i18n.en-US.json')],
					'zh-TW': require('chinese-conv').tify("不能包含以下字符：\\\\()[]\\{\\}")
				}
			});
		});
		it('template literal', function () {
			var result = babel.transformFileSync("./escape.TemplateLiteral.js", {
				plugins: [require('../analyze')],
				ast: true,
				code: false
			});
			var expression = result.ast.program.body[0].expression;
			assert.deepEqual(expression['$$i18n'], {
				source: "function {}() \\{ \\}\t// 空函数",
				target: {
					'en-US': ["function {}() \\{ \\}\t// empty function", require('./repo/escape.TemplateLiteral.js.i18n.en-US.json')],
					'zh-TW': require('chinese-conv').tify("function {0}() \\{ \\}\t// 空函数")
				}
			});
		});
		it('jsx element', function () {
			var result = babel.transformFileSync("./escape.JSXElement.js", {
				plugins: [require('../analyze')],
				parserOpts: { plugins: ['jsx'] },
				ast: true,
				code: false
			});
			var expression = result.ast.program.body[0].expression;
			assert.deepEqual(expression['$$i18n'], {
				source: "function {}() \\{ \\}\t// 空函数",
				target: {
					'en-US': ["function {}() \\{ \\}\t// empty function", require('./repo/escape.JSXElement.js.i18n.en-US.json')],
					'zh-TW': require('chinese-conv').tify("function {0}() \\{ \\}\t// 空函数")
				}
			});
		});
	});
});
