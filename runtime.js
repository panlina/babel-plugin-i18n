i18n = {
	language: undefined,
	translator: {},
	t(language, path, type, text, expression, Component, props) {
		switch (type) {
			case 'StringLiteral':
				var translation = translate(language, path, text) ?? text;
				var component = parse(translation);
				var component = evaluate(component);
				return component[0];
			case 'TemplateLiteral':
				var translation = translate(language, path, text) ?? text;
				var component = parse(translation);
				var component = evaluate(component);
				return component.map((c, i) => i & 1 ? `${c}` : c).join('');
			case 'JSXElement':
				var translation = translate(language, path, text) ?? text;
				var component = parse(translation);
				var component = evaluate(component);
				return React.createElement(Component, props, component);
			case 'JSXFragment':
				var translation = translate(language, path, text) ?? text;
				var component = parse(translation);
				var component = evaluate(component);
				return React.createElement(React.Fragment, {}, component);
		}
		function translate(language, path, text) {
			if (typeof i18n.translator[language] == 'object')
				return lookup(language, path, text);
			else if (typeof i18n.translator[language] == 'function')
				return i18n.translator[language](text);
		}
		function lookup(language, path, text) {
			var [package, path] = path.split(':');
			var dictionary = i18n.translator[language].dictionary;
			var result = dictionary[`${package}:${path}.i18n.${language}.json`]?.[text];
			if (result != undefined) return result;
			var component = path.split('/');
			var dir = component.slice(0, component.length - 1);
			for (var i = dir.length; i >= 0; i--) {
				var result = dictionary[`${package}:${[...dir.slice(0, i), `i18n.${language}.json`].join('/')}`]?.[text];
				if (result != undefined) return result;
			}
		}
		function parse(translation) {
			var component = translation.split(/(?<!\\)\{((?:[^\\}]|\\\\|\\\})*)(?<!\\)\}/);
			for (var i in component)
				if (i & 1)
					component[i] = parseReference(component[i]);
				else
					component[i] = unescape(component[i]);
			return component;
			function unescape(text) {
				return text.replace(/\\([\\{}])/g, "$1");
			}
			function parseReference(text) {
				var match = text.match(/([0-9]+)?(?:\|map ([^}]+))?/);
				var index = match[1] != undefined ? +match[1] : 0;
				var map = match[2] != undefined ? parseMap(match[2]) : undefined;
				return { index: index, map: map };
			}
			function parseMap(text) {
				return Object.fromEntries(text.split(',').map(parseEntry));
			}
			function parseEntry(text) {
				return text.split('->');
			}
		}
		function evaluate(component) {
			if (component.some((e, i) => i & 1 && e.index >= expression.length))
				throw new i18n.IndexOutOfBound();
			for (var i in component)
				if (i & 1) {
					var value = expression[component[i].index];
					if (component[i].map)
						value = component[i].map[value];
					component[i] = value;
				}
			pluralize(component);
			ordinalize(component);
			return component;
		}
		function pluralize(component) {
			for (var i in component) {
				if (i & 1) continue;
				var c = component[i];
				if (c.includes('(s)')) {
					// take the word right before "(s)", replace it with its plural form if quantity > 1, and remove "(s)"
					var [a, b] = c.split('(s)');
					var j = a.lastIndexOf(' ');
					if (j != -1) {
						var aa = a.substr(0, j + 1);
						var ab = a.substr(j + 1);
					} else {
						var aa = "";
						var ab = a;
					}
					if (!+i) throw new i18n.MissingQuantity();
					var quantity = expression[(i >> 1) - 1];
					component[i] = `${aa}${quantity > 1 && i18n.translator[language].pluralize ? i18n.translator[language].pluralize(ab) : ab}${b}`;
				}
			}
		}
		function ordinalize(component) {
			for (var i in component) {
				if (i & 1) continue;
				var c = component[i];
				if (c.includes('(th)')) {
					// take the expression right before "(th)", replace it with its ordinal form, and remove "(th)"
					if (!c.startsWith('(th)')) throw new i18n.MissingOrdinal();
					if (!+i) throw new i18n.MissingOrdinal();
					component[i - 1] = i18n.translator[language].ordinalize ? i18n.translator[language].ordinalize(component[i - 1]) : component[i - 1];
					component[i] = component[i].substr("(th)".length);
				}
			}
		}
	},
	IndexOutOfBound: class extends Error {
		constructor() { super("i18n: translation error: index out of bound."); }
	},
	MissingQuantity: class extends Error {
		constructor() { super("i18n: translation error: missing quantity."); }
	},
	MissingOrdinal: class extends Error {
		constructor() { super("i18n: translation error: missing ordinal."); }
	}
};
i18n = Object.assign(x => x, i18n);
