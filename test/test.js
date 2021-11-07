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
it('template literal', function () {
	var result = babel.transformFileSync("./TemplateLiteral.js", {
		plugins: [require('..')],
		generatorOpts: { jsescOption: { minimal: true } }
	});
	var n = 3;
	var context = { i18n: dictionary, localStorage: { language: 'en-US' }, n: n };
	vm.createContext(context);
	vm.runInContext(t, context);
	assert.equal(vm.runInContext(result.code, context), `${n} message(s)`);
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
it('jsx element', function () {
	var result = babel.transformFileSync("./JSXElement.js", {
		presets: [require('@babel/preset-react')],
		plugins: [require('..')],
		parserOpts: { plugins: ['jsx'] },
		generatorOpts: { jsescOption: { minimal: true } }
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
		parserOpts: { plugins: ['jsx'] },
		generatorOpts: { jsescOption: { minimal: true } }
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
