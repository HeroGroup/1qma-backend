const User = require("../models/User");
const { handleException } = require("../utils");

exports.getUsers = async () => {
	try {
		const users = await User.find();
		return { status: 1, message: "users retrieved successfully!", data: users };
	} catch (e) {
		return handleException(e);
	}
};
