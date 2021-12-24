var t = require("@babel/types");
function reduceStringLiteralExpressions(children) {
	return children.map(child =>
		child.type == 'JSXExpressionContainer' &&
			child.expression.type == 'StringLiteral' &&
			child.expression.value == ' ' ?
			t.jsxText(child.expression.value) :
			child
	);
}
module.exports = reduceStringLiteralExpressions;
