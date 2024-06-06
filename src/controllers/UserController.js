const User = require("../models/User");
const { handleException } = require("../helpers/utils");

exports.getUsers = async () => {
	try {
		const users = await User.find();
		return success("users retrieved successfully!", users);
	} catch (e) {
		return handleException(e);
	}
};

exports.toggleActive = async (params) => {
	try {
		const user = await User.findOneAndUpdate(
			{ _id: params.id },
			{
				isActive: params.active,
			},
			{
				new: true,
			}
		);
		return success("users updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};
