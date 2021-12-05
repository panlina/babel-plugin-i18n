var fs = require('fs');
var path = require('path');
var assert = require('assert');
var vm = require('vm');
var babel = require("@babel/core");
var buildDictionary = require('../buildDictionary');
process.chdir('./test/repo');
var dictionary = buildDictionary('en-US');
var zhTWTranslator = require('./zhTWTranslator');
var translator = {
	'en-US': dictionary,
	'zh-TW': zhTWTranslator
};
var pluralize = require('pluralize');
var runtime = fs.readFileSync(path.join(__dirname, '../runtime.js'), 'utf-8');
it('string literal', function () {
	var result = babel.transformFileSync("./StringLiteral.js", {
		plugins: [require('..')]
	});
	var context = {};
	vm.createContext(context);
	vm.runInContext(runtime, context);
	context.i18n.translator = translator;
	context.i18n.pluralize = pluralize;
	context.i18n.language = 'en-US';
	assert.equal(vm.runInContext(result.code, context), "OK");
});
describe('template literal', function () {
	it('template literal', function () {
		var result = babel.transformFileSync("./TemplateLiteral.js", {
			plugins: [require('..')]
		});
		var name = "Jack";
		var context = { name: name };
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.equal(vm.runInContext(result.code, context), `Hello, ${name}!`);
	});
	it('{}的{}属性', function () {
		var result = babel.transformFileSync("./TemplateLiteral.{}的{}属性.js", {
			plugins: [require('..')]
		});
		var object = 'customer', property = 'name';
		var context = {
			object: object,
			property: property
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.equal(vm.runInContext(result.code, context), `${property} property of ${object}`);
	});
	it('pluralize', function () {
		var result = babel.transformFileSync("./TemplateLiteral.pluralize.js", {
			plugins: [require('..')]
		});
		var n = 3;
		var context = { n: n };
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.equal(vm.runInContext(result.code, context), `${n} messages`);
		n = 1;
		context.n = n;
		assert.equal(vm.runInContext(result.code, context), `${n} message`);
	});
});
var React = {
	createElement(type, props, children) {
		return {
			type: type,
			props: props,
			children: children
		};
	},
	Fragment: function () { }
};
var Icon = function () { };
describe('jsx element', function () {
	it('jsx element', function () {
		var result = babel.transformFileSync("./JSXElement.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var context = {
			React: React,
			Icon: Icon
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("div", {}, [
				"",
				React.createElement(Icon, { type: "plus" }),
				"New"
			])
		);
	});
	it('jsx fragment', function () {
		var result = babel.transformFileSync("./JSXFragment.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var context = {
			React: React,
			Icon: Icon
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement(React.Fragment, {}, [
				"",
				React.createElement(Icon, { type: "plus" }),
				"New"
			])
		);
	});
	it('{}的{}属性', function () {
		var result = babel.transformFileSync("./JSXElement.{}的{}属性.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var object = 'customer', property = 'name';
		var context = {
			React: React,
			object: object,
			property: property
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("span", {}, [
				"", property, " property of ", object, ""
			])
		);
	});
	it('pluralize', function () {
		var result = babel.transformFileSync("./JSXElement.pluralize.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var n = 3;
		var context = {
			React: React,
			Icon: Icon,
			n: n
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("span", {}, [
				"",
				n,
				" messages"
			])
		);
		n = 1;
		context.n = n;
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("span", {}, [
				"",
				n,
				" message"
			])
		);
	});
	it('string prop', function () {
		var result = babel.transformFileSync("./JSXElement.stringProp.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var context = {
			React: React
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("span", { title: "OK" })
		);
	});
	it('member element', function () {
		var result = babel.transformFileSync("./JSXElement.memberElement.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var Radio = { Button: function () { } };
		var context = {
			React: React,
			Radio: Radio
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement(Radio.Button, { value: "text" }, ["Text"])
		);
	});
	it('space', function () {
		var result = babel.transformFileSync("./JSXElement.space.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var context = {
			React: React
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("div", {}, [
				"  me you you  him",
				React.createElement("div", null),
				"it it it"
			])
		);
	});
	it('space.prettier', function () {
		var result = babel.transformFileSync("./JSXElement.space.prettier.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')]
		});
		var context = {
			React: React
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("p", {}, [
				"Click ",
				React.createElement("a", {}, ["here"]),
				" for detail"
			])
		);
	});
});
it('ignore', function () {
	var result = babel.transformFileSync("./ignore.js", {
		plugins: [require('..')]
	});
	var context = {};
	vm.createContext(context);
	vm.runInContext(runtime, context);
	context.i18n.translator = translator;
	context.i18n.pluralize = pluralize;
	context.i18n.language = 'en-US';
	assert.equal(vm.runInContext(result.code, context), "确定");
});
describe('untranslated', function () {
	it('string literal', function () {
		var result = babel.transformFileSync("./untranslated.StringLiteral.js", {
			plugins: [require('..')]
		});
		var context = {};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.equal(vm.runInContext(result.code, context), "伐");
	});
	it('template literal', function () {
		var result = babel.transformFileSync("./untranslated.TemplateLiteral.js", {
			plugins: [require('..')]
		});
		var a = "好";
		var context = { a: a };
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.equal(vm.runInContext(result.code, context), `${a}伐`);
	});
	it('jsx element', function () {
		var result = babel.transformFileSync("./untranslated.JSXElement.js", {
			presets: [require('@babel/preset-react')],
			plugins: [require('..')],
			parserOpts: { plugins: ['jsx'] }
		});
		var a = "好";
		var context = {
			React: React,
			a: a
		};
		vm.createContext(context);
		vm.runInContext(runtime, context);
		context.i18n.translator = translator;
		context.i18n.pluralize = pluralize;
		context.i18n.language = 'en-US';
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("div", {}, [
				"", a, "伐"
			])
		);
	});
});
it('zh-TW', function () {
	var result = babel.transformFileSync("./StringLiteral.js", {
		plugins: [require('..')]
	});
	var context = {};
	vm.createContext(context);
	vm.runInContext(runtime, context);
	context.i18n.translator = translator;
	context.i18n.pluralize = pluralize;
	context.i18n.language = 'zh-TW';
	assert.equal(vm.runInContext(result.code, context), require('chinese-conv').tify("确定"));
});
describe('error', function () {
	describe('index out of bound', function () {
		it('template literal', function () {
			var result = babel.transformFileSync("./error.indexOutOfBound.TemplateLiteral.js", {
				plugins: [require('..')]
			});
			var n = 3;
			var context = { n: n };
			vm.createContext(context);
			vm.runInContext(runtime, context);
			context.i18n.translator = translator;
			context.i18n.pluralize = pluralize;
			context.i18n.language = 'en-US';
			assert.throws(() => {
				vm.runInContext(result.code, context);
			}, context.i18n.IndexOutOfBound);
		});
		it('jsx element', function () {
			var result = babel.transformFileSync("./error.indexOutOfBound.JSXElement.js", {
				presets: [require('@babel/preset-react')],
				plugins: [require('..')],
				parserOpts: { plugins: ['jsx'] }
			});
			var context = {
				React: React,
				Icon: Icon
			};
			vm.createContext(context);
			vm.runInContext(runtime, context);
			context.i18n.translator = translator;
			context.i18n.pluralize = pluralize;
			context.i18n.language = 'en-US';
			assert.throws(() => {
				vm.runInContext(result.code, context);
			}, context.i18n.IndexOutOfBound);
		});
	});
});
it('include', function () {
	var result = babel.transformFileSync("./StringLiteral.mjs", {
		plugins: [require('..')]
	});
	assert.equal(result.code, '"确定";');
});
it('exclude', function () {
	var result = babel.transformFileSync("./exclude.js", {
		plugins: [require('..')]
	});
	assert.equal(result.code, '"确定";');
});
