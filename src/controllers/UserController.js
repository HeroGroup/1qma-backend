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

exports.deleteUser = async (params) => {
	try {
		if (!params.id) {
			return fail("invalid user id");
		}

		const res = await User.deleteOne({
			_id: params.id,
			userType: { $ne: "admin" },
		});

		return success("user removed successfully!", res);
	} catch (e) {
		return handleException(e);
	}
};
