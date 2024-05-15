const bcrypt = require("bcrypt");
const SALT_ROUNDS = env.saltRounds;

exports.handleException = (e) => {
	if (!(e instanceof Error)) {
		e = new Error(e);
	}

	return fail(e.message);
};

exports.getRandomInt = (min, max) => {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

exports.createHashedPasswordFromPlainText = (input) => {
	const salt = bcrypt.genSaltSync(SALT_ROUNDS);
	return bcrypt.hashSync(input, salt);
};
