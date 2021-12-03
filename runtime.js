i18n = {
	language: {},
	t(language, path, type, text, expression, Component, props) {
		switch (type) {
			case 'StringLiteral':
				return translate(language, path, text) ?? text;
			case 'TemplateLiteral':
				var translation = translate(language, path, text) ?? text;
				var component = translation.split(/\{([0-9]?)\}/);
				if (component.some((e, i) => i & 1 && (e ? +e : 0) >= expression.length)) throw new i18n.IndexOutOfBound();
				return component.map((c, i) => i & 1 ? `${expression[c ? +c : 0]}` : c).join('');
			case 'JSXElement':
				var translation = translate(language, path, text) ?? text;
				var component = translation.split(/\{([0-9]?)\}/);
				if (component.some((e, i) => i & 1 && (e ? +e : 0) >= expression.length)) throw new i18n.IndexOutOfBound();
				return React.createElement(Component, props, component.map((c, i) => i & 1 ? expression[c ? +c : 0] : c));
			case 'JSXFragment':
				var translation = translate(language, path, text) ?? text;
				var component = translation.split(/\{([0-9]?)\}/);
				return React.createElement(React.Fragment, {}, component.map((c, i) => i & 1 ? expression[c ? +c : 0] : c));
		}
		function translate(language, path, text) {
			if (typeof i18n.language[language] == 'object')
				return lookup(language, path, text);
			else if (typeof i18n.language[language] == 'function')
				return i18n.language[language](text);
		}
		function lookup(language, path, text) {
			var dictionary = i18n.language[language];
			var result = dictionary[`${path}.i18n.${language}.json`]?.[text];
			if (result != undefined) return result;
			var component = path.split('/');
			var dir = component.slice(0, component.length - 1);
			for (var i = dir.length; i >= 0; i--) {
				var result = dictionary[[...dir.slice(0, i), `i18n.${language}.json`].join('/')]?.[text];
				if (result != undefined) return result;
			}
		}
	},
	IndexOutOfBound: class extends Error {
		constructor() { super("i18n: translation error: index out of bound."); }
	}
};