const bcrypt = require("bcrypt");
const { unlink } = require("node:fs");
const SALT_ROUNDS = parseInt(env.saltRounds);

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

exports.createReferCode = () => {
	return `${this.getRandomInt(999, 9999)}${this.getRandomInt(
		999,
		9999
	)}${this.getRandomInt(999, 9999)}`;
};

exports.checkSame = (text, password) => {
	if (!text || !password) {
		return false;
	}

	return bcrypt.compareSync(text, password);
};

exports.validateImageFileType = (extension) => {
	const filetypes = /jpeg|jpg|png|gif/;
	return filetypes.test(extension.toLowerCase());
};

exports.removeFile = (fileToUnlink) => {
	unlink(fileToUnlink, function (err) {
		if (err) throw err;
		console.log(`${fileToUnlink} removed successfully!`);
	});
};

exports.createAccessToken = () => {
	return Math.round(Math.random() * 1e9) + "" + Date.now();
};
