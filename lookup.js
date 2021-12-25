function lookup(dictionary, source) {
	if (dictionary.hasOwnProperty(source))
		return [dictionary[source], dictionary];
	if (dictionary.__proto__)
		return lookup(dictionary.__proto__, source);
}
module.exports = lookup;
