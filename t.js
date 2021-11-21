function t(language, path, type, text, expression, Component, props) {
	switch (type) {
		case 'StringLiteral':
			return language ? lookup(path, text) ?? text : text;
		case 'TemplateLiteral':
			var translation = language ? lookup(path, text) ?? text : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return component.map((c, i) => i & 1 ? `${expression[c ? +c : 0]}` : c).join('');
		case 'JSXElement':
			var translation = language ? lookup(path, text) ?? text : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return React.createElement(Component, props, component.map((c, i) => i & 1 ? expression[c ? +c : 0] : c));
		case 'JSXFragment':
			var translation = language ? lookup(path, text) ?? text : text;
			var component = translation.split(/\{([0-9]?)\}/);
			return React.createElement(React.Fragment, {}, component.map((c, i) => i & 1 ? expression[c ? +c : 0] : c));
	}
	function lookup(path, text) {
		var result = i18n[`${path}.i18n.json`]?.[text];
		if (result != undefined) return result;
		var component = path.split('/');
		var dir = component.slice(0, component.length - 1);
		for (var i = dir.length; i >= 0; i--) {
			var result = i18n[[...dir.slice(0, i), 'i18n.json'].join('/')]?.[text];
			if (result != undefined) return result;
		}
	}
}
