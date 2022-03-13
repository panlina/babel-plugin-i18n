var removeJSXWhitespaces = require("./removeJSXWhitespaces");
var reduceStringLiteralExpressions = require("./reduceStringLiteralExpressions");
/**
 * @param {import("@babel/types").StringLiteral | import("@babel/types").TemplateLiteral | import("@babel/types").JSXElement | import("@babel/types").JSXFragment } node
 * @returns {string}
 * @example
 * "确定" -> "确定"
 * `你好，${name}` -> "你好，{}"
 * <div>你好，{name}</div> -> "你好，{}"
 * <>你好，{name}</> -> "你好，{}"
 */
function abstract(node) {
	switch (node.type) {
		case 'StringLiteral':
			return escape(node.value);
		case 'TemplateLiteral':
			return node.quasis.map(
				quasi => escape(quasi.value.cooked)
			).join("{}");
		case 'JSXElement':
		case 'JSXFragment':
			return reduceStringLiteralExpressions(node.children).map(child =>
				child.type == 'JSXText' ?
					escape(removeJSXWhitespaces(child.value)) :
					child.type == 'JSXExpressionContainer' && child.expression.type == 'JSXEmptyExpression' ?
						"" :
						"{}"
			).join('');
	}
	/** @param {string} text */
	function escape(text) {
		return text.replace(/([\\{}])/g, "\\$1");
	}
}
module.exports = abstract;
