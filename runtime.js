I18n = function () {
	var i18n = {
		language: undefined,
		translator: {},
		t(language, path, key, type, text, expression, Component, props) {
			var translation = translate(language, path, key, text) ?? text;
			var component = parse(translation);
			// fill in references for untranslated text
			if (translation == text) fillInReferences(component);
			var component = evaluate(component);
			switch (type) {
				case 'StringLiteral':
					return component[0];
				case 'TemplateLiteral':
					return component.map((c, i) => i & 1 ? `${c}` : c).join('');
				case 'JSXElement':
					return i18n.React.createElement(Component, props, component);
				case 'JSXFragment':
					return i18n.React.createElement(i18n.React.Fragment, {}, component);
			}
			function translate(language, path, key, text) {
				if (typeof i18n.translator[language] == 'object')
					return lookup(language, path, key, text);
				else if (typeof i18n.translator[language] == 'function')
					return i18n.translator[language](text);
			}
			/**
			 * Fill in all references with index for untranslated text, so that text is kept verbatim.
			 * @example
			 * "a{}b{}c" -> "a{0}b{1}c"
			 */
			function fillInReferences(component) {
				for (var i in component)
					if (i & 1)
						component[i].index = i >> 1;
			}
			function lookup(language, path, key, text) {
				var [package, path] = path.split(':');
				var dictionary = i18n.translator[language].dictionary;
				if (key) return dictionary[`${package}:${path}.i18n.${language}.json`]?.[`:${key}`];
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
				var component = splitTranslation(translation);
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
					var match = text.match(/([0-9]+|(?:[a-zA-Z][a-zA-Z0-9]*))?(?:\|map ([^}]+))?/);
					var index = match[1] != undefined ? !isNaN(+match[1]) ? +match[1] : match[1] : 0;
					var map = match[2] != undefined ? parseMap(match[2]) : undefined;
					return { index: index, map: map };
				}
				function parseMap(text) {
					return Object.fromEntries(text.split(',').map(parseEntry));
				}
				function parseEntry(text) {
					return text.split('->');
				}
				/**
				 * RegExp lookbehind may not be supported, so this function is extracted to handle this.
				 * It uses lookbehind when it's supported, and switch to a less efficient workaround if not.
				 */
				function splitTranslation(translation) {
					if (!i18n.splitTranslationRegExp)
						try {
							i18n.splitTranslationRegExp =
								new RegExp("(?<!\\\\)\\{((?:[^\\\\}]|\\\\\\\\|\\\\\\})*)(?<!\\\\)\\}");
						}
						catch (e) {
							i18n.splitTranslationRegExp = e;
						}
					if (i18n.splitTranslationRegExp instanceof RegExp)
						return translation.split(i18n.splitTranslationRegExp);
					else {
						// The method is to reverse both the string and the RegExp, so that lookbehind becomes lookahead.
						// Got this from https://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
						return reverseString(translation)
							.split(/\}(?!\\)((?:[^\\}]|\\\\|\}\\)*)\{(?!\\)/)
							.map(reverseString)
							.reverse();
						function reverseString(s) {
							return s.split('').reverse().join('');
						}
					}
				}
			}
			function evaluate(component) {
				if (component.some((e, i) => i & 1 && typeof e.index == 'number' && e.index >= expression.length))
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
		indexArray(array, map) {
			for (var key in map)
				array[key] = array[map[key]];
			return array;
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
	return i18n;
}
