const User = require("../../models/User");
const { validateEmail } = require("../../helpers/validator");
const {
	handleException,
	getRandomInt,
	createHashedPasswordFromPlainText,
	checkSame,
} = require("../../helpers/utils");

exports.login = async (params) => {
	try {
		// check email is valid
		if (!validateEmail(params.email)) {
			return fail("invalid email address!", params);
		}

		if (!params.password) {
			return fail("Enter password!", params);
		}

		const user = await User.findOne({
			email: params.email,
			userType: "admin",
			isActive: true,
		});

		if (!user || !checkSame(params.password, user.password)) {
			return fail("Invalid email and password combination!", params);
		}

		// create and send some token as well
		const token = Math.round(Math.random() * 1e9) + "" + Date.now();
		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $push: { accessTokens: { token, expire: null } } },
			{ new: true }
		);

		return success("successfull login!", { token });
	} catch (e) {
		return handleException(e);
	}
};

exports.createAdminUser = async (params) => {
	try {
		const newUser = new User({
			referCode: `${getRandomInt(999, 9999)}${getRandomInt(
				999,
				9999
			)}${getRandomInt(999, 9999)}`,
			email: "admin@1qma.games",
			emailVerified: true,
			password: createHashedPasswordFromPlainText("admin"),
			userType: "admin",
			isActive: true,
			hasCompletedSignup: false,
			created_at: moment(),
		});

		await newUser.save();

		return success("Admin user was created successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.dashboard = async (params) => {
	try {
		const usersCount = await User.countDocuments();
		const gamesCount = 0;

		return success("", { usersCount, gamesCount });
	} catch (e) {
		return handleException(e);
	}
};

exports.updatePassword = async (params) => {
	try {
		const { id, currentPassword, password, passwordConfirmation } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		if (!user.password) {
			return fail("You havae not set password yet!");
		}

		if (!currentPassword) {
			return fail("Old password is not provided!");
		}

		if (!checkSame(currentPassword, user.password)) {
			return fail("Old password is incorrect!");
		}

		if (!password) {
			return fail("New password is not provided!");
		}
		if (!passwordConfirmation) {
			return fail("Password confirmation is not provided!");
		}
		if (password !== passwordConfirmation) {
			return fail("New password and confirmation are not match!");
		}

		// update password
		const newPassword = createHashedPasswordFromPlainText(password);
		await User.findOneAndUpdate({ _id: id }, { password: newPassword });

		return success("Password was updated successfully! Please login now.");
	} catch (e) {
		return handleException(e);
	}
};

exports.logout = async (id, authToken) => {
	try {
		if (!id) {
			return fail("invalid id!");
		}
		if (!authToken) {
			return fail("invalid token!");
		}

		await User.findOneAndUpdate(
			{ _id: id },
			{ $pull: { accessTokens: { token: authToken } } }
		);

		return success("user logged out successfully!");
	} catch (e) {
		return handleException(e);
	}
};
