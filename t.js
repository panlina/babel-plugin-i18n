function t(language, path, type, text, expression, Component, props) {
	switch (type) {
		case 'StringLiteral':
			var dictionary = i18n[`${path}.i18n.json`];
			return language && text in dictionary ? dictionary[text] : text;
		case 'TemplateLiteral':
			var dictionary = i18n[`${path}.i18n.json`];
			var translation = language && text in dictionary ? dictionary[text] : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return component.map((c, i) => i & 1 ? `${expression[(i - 1) / 2]}` : c).join('');
		case 'JSXElement':
			var dictionary = i18n[`${path}.i18n.json`];
			var translation = language && text in dictionary ? dictionary[text] : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return React.createElement(Component, props, component.map((c, i) => i & 1 ? expression[(i - 1) / 2] : c));
		case 'JSXFragment':
			var dictionary = i18n[`${path}.i18n.json`];
			var translation = language && text in dictionary ? dictionary[text] : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return React.createElement(React.Fragment, {}, component.map((c, i) => i & 1 ? expression[(i - 1) / 2] : c));
	}
}
