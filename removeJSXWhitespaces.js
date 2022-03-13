/**
 * @param {string} text
 * @example
 * <div>  我
 * 	你你  他
 * 	<div />
 * 	它它它
 * </div>
 * ->
 * <div>  我 你你  他<div />它它它</div>
 */
function removeJSXWhitespaces(text) {
	var lines = text.split('\n');
	return lines
		.map((line, i) => {
			if (i)
				line = line.trimLeft();
			if (i != lines.length - 1)
				line = line.trimRight();
			return line;
		})
		.filter(line => line)
		.join(' ');
}
module.exports = removeJSXWhitespaces;
