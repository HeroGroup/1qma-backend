const User = require("../models/User");
const { getRandomInt } = require("./utils");

exports.createUniqueReferCode = async () => {
	let referCode;
	let referCodeIsrepetetive = true;
	do {
		referCode = `${getRandomInt(999, 9999)}${getRandomInt(
			999,
			9999
		)}${getRandomInt(999, 9999)}`;
		// check if repetetive
		const referCodeCount = await User.countDocuments({ referCode });
		if (referCodeCount === 0) {
			referCodeIsrepetetive = false;
		}
	} while (referCodeIsrepetetive);

	return referCode;
};
