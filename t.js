function t(language, path, type, text, expression) {
	switch (type) {
		case 'StringLiteral':
			var dictionary = i18n[`${path}.i18n.json`];
			return language && text in dictionary ? dictionary[text] : text;
	}
}
