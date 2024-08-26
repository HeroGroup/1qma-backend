const User = require("../models/User");

exports.createUniqueAnonymousName = async (len = 6) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

	const charactersLength = characters.length;
	let anonymousNameIsrepetetive = true;
	let anonymousName = "";

	do {
		anonymousName = "";
		let counter = 0;
		while (counter < len) {
			anonymousName += characters.charAt(
				Math.floor(Math.random() * charactersLength)
			);
			counter += 1;
		}

		const anonymousNameCount = await User.countDocuments({ anonymousName });
		if (anonymousNameCount === 0) {
			anonymousNameIsrepetetive = false;
		}
	} while (anonymousNameIsrepetetive);

	return anonymousName;
};
