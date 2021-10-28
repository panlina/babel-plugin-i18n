module.exports = {
	languageExpression(t) {
		return t.memberExpression(
			t.identifier('localStorage'),
			t.identifier('language')
		);
	}
};
