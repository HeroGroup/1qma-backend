const User = require("../models/User");

exports.updateUserSocketId = async (userId, socketId) => {
	await User.findByIdAndUpdate(userId, { socketId });
};
