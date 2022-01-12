var removeJSXWhitespaces = require("./removeJSXWhitespaces");
var reduceStringLiteralExpressions = require("./reduceStringLiteralExpressions");
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
	function escape(text) {
		return text.replace(/([\\{}])/g, "\\$1");
	}
}
module.exports = abstract;
