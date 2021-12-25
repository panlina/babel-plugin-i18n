var getStat = require('./getStat');
module.exports = function (file, language) {
	var [m, n] = getStat(file, language);
	console.log(`${m}/${n} entries translated. Coverage: ${(m / n * 100).toFixed(2)}%.`);
};
