const bcrypt = require("bcrypt");
const {
	handleException,
	createHashedPasswordFromPlainText,
} = require("../../helpers/utils");
const User = require("../../models/User");
const AccountType = require("../../models/AccountType");

const genders = [
	{ _id: "0", title: "Male" },
	{ _id: "1", title: "Female" },
	{ _id: "2", title: "prefer not to say" },
];

const educations = [
	{
		_id: "0",
		title: "Uneducated",
	},
	{
		_id: "1",
		title: "Bachelor Degree",
	},
	{
		_id: "2",
		title: "Masters Degree",
	},
	{
		_id: "3",
		title: "Phd",
	},
];

exports.init = async () => {
	try {
		const accountTypes = await AccountType.find();

		return success("initialize parameters", {
			genders,
			educations,
			accountTypes,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.updateProfile = async (params) => {
	try {
		const { id, oldPassword, password, passwordConfirmation } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		let user = User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		const update = {
			firstName: params.firstName,
			lastName: params.lastName,
			gender: params.gender,
			education: params.education,
			country: params.country,
			city: params.city,
			accountType: params.accountType,
		};

		if (oldPassword && password && passwordConfirmation) {
			if (!bcrypt.compareSync(oldPassword, user.password)) {
				return fail("current password is incorrect!");
			}

			if (password !== passwordConfirmation) {
				return fail("password and password confirmation does not match!");
			}

			const newPassword = createHashedPasswordFromPlainText(password);

			update["password"] = newPassword;
		}

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ ...update },
			{ new: true }
		);

		return success("User profile was updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};
