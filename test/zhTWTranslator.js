var conv = require('chinese-conv');
// 简简{}简简{}简简->繁繁{0}繁繁{1}繁繁
module.exports = simplified => {
	var traditional = conv.tify(simplified);
	var components = traditional.split(/(\{\})/);
	return components.map((child, i) =>
		i & 1 ?
			`{${i++ >> 1}}` :
			child
	).join('');
};
