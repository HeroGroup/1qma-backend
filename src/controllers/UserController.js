const User = require("../models/User");
const { handleException } = require("../utils");

exports.getUsers = async () => {
	try {
		const users = await User.find({}, { __v: -1 });
		return { status: 1, message: "users retrieved successfully!", data: users };
	} catch (e) {
		return handleException(e);
	}
};

exports.addSampleUser = async () => {
	const user = new User({
		firstName: "Navid",
		lastName: "Hero",
		email: "navid@gmail.com",
		mobile: "09177048781",
		isActive: true,
		hasCompletedSignup: false,
		referCode: "731086912583",
		created_at: moment(),
		emailVerified: false,
		mobileVerified: false,
	});

	await user.save();

	return success("sample user added successfully.", user);
};
