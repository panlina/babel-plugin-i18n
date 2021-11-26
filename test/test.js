var fs = require('fs');
var path = require('path');
var assert = require('assert');
var vm = require('vm');
var babel = require("@babel/core");
var buildDictionary = require('../buildDictionary');
process.chdir('./test/repo');
var dictionary = buildDictionary();
var t = fs.readFileSync(path.join(__dirname, '../t.js'), 'utf-8');
it('string literal', function () {
	var result = babel.transformFileSync("./StringLiteral.js", {
		plugins: [require('..')]
	});
	var context = { i18n: dictionary, localStorage: { language: 'en-US' } };
	vm.createContext(context);
	vm.runInContext(t, context);
	assert.equal(vm.runInContext(result.code, context), "OK");
});
describe('template literal', function () {
	it('template literal', function () {
		var result = babel.transformFileSync("./TemplateLiteral.js", {
			plugins: [require('..')]
		});
		var n = 3;
		var context = { i18n: dictionary, localStorage: { language: 'en-US' }, n: n };
		vm.createContext(context);
		vm.runInContext(t, context);
		assert.equal(vm.runInContext(result.code, context), `${n} message(s)`);
	});
	it('{}的{}属性', function () {
		var result = babel.transformFileSync("./TemplateLiteral.{}的{}属性.js", {
			plugins: [require('..')]
		});
		var object = 'customer', property = 'name';
		var context = {
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			object: object,
			property: property
		};
		vm.createContext(context);
		vm.runInContext(t, context);
		assert.equal(vm.runInContext(result.code, context), `${property} property of ${object}`);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React,
			Icon: Icon
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React,
			Icon: Icon
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React,
			object: object,
			property: property
		};
		vm.createContext(context);
		vm.runInContext(t, context);
		assert.deepEqual(
			vm.runInContext(result.code, context),
			React.createElement("span", {}, [
				"", property, " property of ", object, ""
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React,
			Radio: Radio
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
	var context = { i18n: dictionary, localStorage: { language: 'en-US' } };
	vm.createContext(context);
	vm.runInContext(t, context);
	assert.equal(vm.runInContext(result.code, context), "确定");
});
describe('untranslated', function () {
	it('string literal', function () {
		var result = babel.transformFileSync("./untranslated.StringLiteral.js", {
			plugins: [require('..')]
		});
		var context = { i18n: dictionary, localStorage: { language: 'en-US' } };
		vm.createContext(context);
		vm.runInContext(t, context);
		assert.equal(vm.runInContext(result.code, context), "伐");
	});
	it('template literal', function () {
		var result = babel.transformFileSync("./untranslated.TemplateLiteral.js", {
			plugins: [require('..')]
		});
		var a = "好";
		var context = { i18n: dictionary, localStorage: { language: 'en-US' }, a: a };
		vm.createContext(context);
		vm.runInContext(t, context);
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
			i18n: dictionary,
			localStorage: { language: 'en-US' },
			React: React,
			a: a
		};
		vm.createContext(context);
		vm.runInContext(t, context);
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
	var context = { i18n: dictionary, localStorage: { language: 'zh-TW' } };
	vm.createContext(context);
	vm.runInContext(t, context);
	assert.equal(vm.runInContext(result.code, context), "確定");
});
