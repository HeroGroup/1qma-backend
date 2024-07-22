const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { unlink } = require("node:fs");
const QRCode = require("qrcode");
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

exports.createGameCode = () => {
	return Math.round(Math.random() * 1e9);
};

exports.getSocketClient = async (socketId) => {
	const sockets = await io.fetchSockets();
	const socket = sockets.find((element) => element.id === socketId);

	return socket;
};

exports.joinUserToGameRoom = async (socketId, room) => {
	const socket = await this.getSocketClient(socketId);
	if (socket) {
		socket.join(room);
	}
};

exports.leaveRoom = async (socketId, room) => {
	const socket = await this.getSocketClient(socketId);
	if (socket) {
		socket.leave(room);
	}
};

exports.objectId = (input) => {
	return mongoose.Types.ObjectId.createFromHexString(input);
};

exports.generateQR = async (text) => {
	try {
		return await QRCode.toDataURL(text);
	} catch (err) {
		console.error("generateQR", err);
		return "";
	}
};
