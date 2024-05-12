const User = require("../models/User");

exports.getUsers = async () => {
	return await User.find(
		{},
		{ firstName: 1, lastName: 1, email: 1, isActive: 1 } // projection
	);
};

exports.addUser = async (params) => {
	const newUser = new User({
		firstName: params.firstName,
		lastName: params.lastName,
		email: params.email,
		password: params.password,
		isActive: false,
	});

	await newUser.save();

	return `${params.firstName} ${params.lastName} is now a user.`;
};
