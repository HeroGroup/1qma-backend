const {
	handleException,
	createHashedPasswordFromPlainText,
	checkSame,
	removeFile,
	objectId,
} = require("../../helpers/utils");
const User = require("../../models/User");
const AccountType = require("../../models/AccountType");
const { validateEmail } = require("../../helpers/validator");
const Category = require("../../models/Category");
const Question = require("../../models/Question");

const {
	languages,
	genders,
	educations,
	homePages,
} = require("../../helpers/constants");

exports.init = async () => {
	try {
		const accountTypes = await AccountType.find();
		const categories = await Category.find();

		return success("initialize parameters", {
			languages,
			genders,
			educations,
			accountTypes,
			categories,
			homePages,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.updateProfile = async (params) => {
	try {
		const { id, currentPassword, password, passwordConfirmation } = params;
		let { gender, education } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		let user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		if (gender) {
			const updatedGender = genders.find((element) => element._id === gender);
			if (!updatedGender) {
				return fail("invalid gender was selected!", params);
			}
			gender = updatedGender;
		}

		if (education) {
			const updatedEducation = educations.find(
				(element) => element._id === education
			);

			if (!updatedEducation) {
				return fail("invalid education was selected", params);
			}
			education = updatedEducation;
		}

		const update = {
			firstName: params.firstName,
			lastName: params.lastName,
			gender,
			education,
			country: params.country,
			city: params.city,
			accountType: params.accountType,
		};

		console.log(currentPassword, password, passwordConfirmation, user.password);
		if (currentPassword && password && passwordConfirmation && user.password) {
			if (!checkSame(currentPassword, user.password)) {
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

exports.updateUserSettings = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		const user = await User.findOneAndUpdate(
			{ _id: id },
			{
				preferedLanguage: params.language,
				defaultHomePage: params.defaultHomePage,
			},
			{
				new: true,
			}
		);

		return success("User settings was updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateProfilePicture = async (params, avatar) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		if (!avatar) {
			return fail("invalid avatar!");
		}

		let user = User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		avatar.path = avatar.path.replace("public/", "");

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ profilePicture: avatar.path },
			{ new: true }
		);
		return success("profile picture updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.removeProfilePicture = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		let user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		if (user.profilePicture) {
			removeFile(`${__basedir}/public/${user.profilePicture}`);
		}

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ profilePicture: "" },
			{ new: true }
		);

		return success("profile picture removed successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.invite = async (params) => {
	try {
		const { id, email } = params;
		if (!id) {
			return fail("invalid user id");
		}
		if (!validateEmail(email)) {
			return fail("invalid email!");
		}

		// TODO: check limit

		// check if email is already exists
		const existingEmail = await User.countDocuments({
			email,
			emailVerified: true,
		});
		if (existingEmail > 0) {
			return fail("This email address is already in!");
		}

		// add it to user invitations
		await User.findOneAndUpdate(
			{ _id: id },
			{ $push: { invitations: { email, status: "pending" } } }
		);

		// TODO: create and send invite link
		return success(`Invitation Email was sent to ${email}`);
	} catch (e) {
		return handleException(e);
	}
};

exports.userDetails = async (id) => {
	try {
		if (!id) {
			return fail("invalid id!");
		}

		const user = await User.findById(id, {
			_id: 0,
			firstName: 1,
			lastName: 1,
			profilePicture: 1,
			statistics: 1,
			games: 1,
		});

		if (!user) {
			return fail("invalid user!");
		}

		return success("User retrieved successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.listQuestions = async (userId, params) => {
	try {
		const { category, type, search } = params;
		const page = params.page || 1;
		const limit = params.limit || 5;

		if (!category) {
			return fail("invalid category!");
		}
		if (!type) {
			return fail(
				"invalid type! Type should be public, private, or bookmarked."
			);
		}

		console.log(category, type, search);

		const questions = await Question.find(
			{
				"category._id": objectId(category),
				...(type === "private" ? { "user._id": userId } : {}),
				...(search ? { question: { $regex: search, $options: "i" } } : {}),
			},
			{
				_id: 1,
				category: 1,
				question: 1,
				answer: 1,
			}
		)
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", questions);
	} catch (e) {
		return handleException(e);
	}
};

exports.addQuestion = async (params) => {
	try {
		const { id, category, question, answer } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!category) {
			return fail("invalid category!");
		}

		if (!question) {
			return fail("invalid question!");
		}

		const user = await User.findById(id, {
			_id: 1,
			firstName: 1,
			lastName: 1,
			email: 1,
			profilePicture: 1,
		});
		if (!user) {
			return fail("invalid user!");
		}

		const dbCategory = await Category.findById(category, {
			_id: 1,
			name: 1,
			icon: 1,
		});
		if (!dbCategory) {
			return fail("invalid category!");
		}

		const newQuestion = new Question({
			question,
			answer,
			category,
			user,
		});
		await newQuestion.save();

		return success(
			"Question was successfully added to your library!",
			newQuestion
		);
	} catch (e) {
		return handleException(e);
	}
};
