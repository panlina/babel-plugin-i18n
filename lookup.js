/**
 * @param {Dictionary} dictionary
 * @param {string} source
 * @returns {[translation: string, Dictionary] | undefined}
*/
function lookup(dictionary, source) {
	if (dictionary.hasOwnProperty(source))
		return [dictionary[source], dictionary];
	if (dictionary.__proto__)
		return lookup(dictionary.__proto__, source);
}
module.exports = lookup;
