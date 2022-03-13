var t = require("@babel/types");
/**
 * @param {import("@babel/core").types.JSXElement["children"]} children
 * @example
 * <p>
 * 	点击{" "}
 * 	<a>这里</a>
 * 	{" "}查看详情
 * </p>
 * ->
 * <p>
 * 	点击 <a>这里</a> 查看详情
 * </p>
 */
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
