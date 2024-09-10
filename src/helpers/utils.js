const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { unlink } = require("node:fs");
const QRCode = require("qrcode");
const fs = require("fs");

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
	const SALT_ROUNDS = parseInt(env.saltRounds);
	const salt = bcrypt.genSaltSync(SALT_ROUNDS);
	return bcrypt.hashSync(input, salt);
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

exports.joinUserToGameRoom = async (socketId, room, email = "unknown") => {
	const socket = await this.getSocketClient(socketId);
	if (socket) {
		socket.join(room);
		console.log(`email: ${email}, socket id: ${socketId} joined to ${room}`);
	}
};

exports.leaveRoom = async (socketId, room, email = "unknown") => {
	const socket = await this.getSocketClient(socketId);
	if (socket) {
		socket.leave(room);
		console.log(`email: ${email}, socket id: ${socketId} left ${room}`);
	}
};

exports.objectId = (input) => {
	if (typeof input === "string") {
		return mongoose.Types.ObjectId.createFromHexString(input);
	} else {
		// "object"
		return input;
	}
};

exports.generateQR = async (text) => {
	try {
		return await QRCode.toDataURL(text);
	} catch (err) {
		console.error("generateQR", err);
		return "";
	}
};

exports.xpNeededForNextLevel = (level) => {
	let increment = 0;
	if (level < 5) {
		increment = 500;
	} else if (level < 10) {
		increment = 1000;
	} else if (level < 15) {
		increment = 2000;
	} else if (level < 20) {
		increment = 4000;
	} else {
		increment = 8000;
	}

	return 500 + level * increment;
};

exports.scoreNeededForNextCheckpoint = (checkpoint) => {
	switch (checkpoint) {
		case 0:
			return 50;
		case 1:
			return 100;
		case 2:
			return 200;
		case 3:
			return 300;

		default:
			break;
	}
};

exports.renameFile = (src, dst) => {
	fs.rename(src, dst, function (err) {
		if (err) console.log(err);
	});
};
