const bcrypt = require("bcrypt");
const { validateEmail, validateMobile } = require("../../helpers/validator");
const {
	handleException,
	getRandomInt,
	createHashedPasswordFromPlainText,
	createReferCode,
} = require("../../helpers/utils");
const AccountType = require("../../models/AccountType");
const Category = require("../../models/Category");
const Setting = require("../../models/Setting");
const User = require("../../models/User");
const Verification = require("../../models/Verification");

const languages = [{ _id: "0", code: "en", title: "English" }];

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
	const NEXT_VERIFICATION_MINUTES = await Setting.findOne({
		key: "NEXT_VERIFICATION_MINUTES",
	});

	const furthurQuestions = [
		{
			question: "Tell us more about yourself",
			type: "text",
		},
		{
			question: "What do you usually do in your free time?",
			type: "multiple_options",
			options: {
				1: "sport",
				2: "leasure",
				3: "reading",
				4: "watching TV",
				5: "outing",
			},
		},
		{
			question: "Maritial Status",
			type: "single_option",
			options: {
				1: "single",
				2: "married",
				3: "separated",
				4: "prefer not to say",
			},
		},
	];
	const accountTypes = await AccountType.find();
	const categories = await Category.find();

	return success("initialize parameters", {
		languages,
		genders,
		educations,
		categories,
		accountTypes,
		nextVerificationMinutes: NEXT_VERIFICATION_MINUTES.value,
		furthurQuestions,
	});
};

exports.loginWithEmail = async (params) => {
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
			emailVerified: true,
			isActive: true,
		});
		if (!user || !bcrypt.compareSync(params.password, user.password)) {
			return fail("Invalid email and password combination!", params);
		}

		delete user["password"];
		// delete user["__v"];

		// TODO: send some bearer token as well

		return success("successfull login!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.joinToWaitListWithEmailAndMobile = async (params) => {
	// check email is valid
	if (!validateEmail(params.email)) {
		return fail("invalid email address!", params);
	}

	// check mobile is present and valid
	if (!validateMobile(params.mobile)) {
		return fail("Enter a valid mobile phone!", params);
	}

	// check email is available
	const emailExists = await User.countDocuments({
		email: params.email,
		emailVerified: true,
	});
	if (emailExists > 0) {
		return fail("This email address is already in use!", params);
	}

	// check phone is available
	const mobileExists = await User.countDocuments({
		mobile: params.mobile,
		mobileVerified: true,
	});
	if (mobileExists > 0) {
		return fail("This phone number is already in use!", params);
	}

	const newUser = new User({
		referCode: createReferCode(),
		email: params.email,
		emailVerified: false,
		mobile: params.mobile,
		mobileVerified: false,
		inWaitList: true,
		isActive: false,
		hasCompletedSignup: false,
		created_at: moment(),
	});

	newUser.save();

	// send verification codes to email and mobile
	createEmailVerification(params.email);
	createMobileVerification(params.mobile);

	return success("Verification code was sent to you!", params);
};

exports.joinToWaitListWithMobile = async (params) => {
	// check email is valid
	if (!params.id) {
		return fail("invalid user id!", params);
	}

	// check mobile is present and valid
	if (!validateMobile(params.mobile)) {
		return fail("Enter a valid mobile phone!", params);
	}

	// check phone is available
	const mobileExists = await User.countDocuments({
		mobile: params.mobile,
		mobileVerified: true,
	});
	if (mobileExists > 0) {
		return fail("This phone number is already in use!", params);
	}

	await User.findOneAndUpdate(
		{ _id: id },
		{ mobile: params.mobile, mobileVerified: false }
	);

	// send verification code to mobile
	createMobileVerification(params.mobile);

	return success("Verification code was sent to your phone!", params);
};

exports.registerWithReferal = async (params) => {
	try {
		const refererUser = await User.findOne({ referCode: params.referer });

		if (!refererUser) {
			return fail("unknown referer!", params);
		}

		// check number of people refered
		const referedUsersCount = await User.countDocuments({
			"referer._id": refererUser._id,
			emailVerified: true,
			mobileVerified: true,
		});

		const maxNumberOfAllowedRefers = await Setting.findOne({
			key: "MAX_NUMBER_OF_ALLOWED_REFERS",
		});

		if (referedUsersCount >= maxNumberOfAllowedRefers.value) {
			return fail(
				"Unfortunately your referer has reached their maximum allowed invites!"
			);
		}

		const newUser = new User({
			referCode: createReferCode(),
			referer: {
				_id: refererUser._id,
				firstName: refererUser.firstName,
				lastName: refererUser.lastName,
			},
			isActive: true,
			hasCompletedSignup: false,
			created_at: moment(),
		});

		await newUser.save();

		return success("New User was created successfully!", newUser);
	} catch (e) {
		return handleException(e);
	}
};

exports.setEmail = async (params) => {
	try {
		const { id, email } = params;
		if (!validateEmail(email)) {
			return fail("invalid email address!");
		}

		// check if email exists
		const users = await User.countDocuments({
			email,
			emailVerified: true,
			$or: [{ inWaitList: false }, { inWaitList: { $exists: false } }],
		});

		if (users > 0) {
			return fail("This email address is already in use!");
		}

		const user = await User.findOneAndUpdate(
			{ _id: id },
			{ email, emailVerified: false },
			{ new: true }
		);

		createEmailVerification(email);

		return success("Verification code was sent to your email!", {
			params,
			user,
		});
	} catch (e) {
		handleException(e);
	}
};

exports.setPassword = async (params) => {
	try {
		const { id, email, verificationCode, password, passwordConfirmation } =
			params;

		if (!id) {
			return fail("invalid user id!");
		}

		if (!validateEmail(email)) {
			return fail("invalid email address!");
		}

		if (!password) {
			return fail("please enter a new password!");
		}

		if (!passwordConfirmation) {
			return fail("please enter password confirmation!");
		}

		if (password !== passwordConfirmation) {
			return fail("password and password confirmation does not match!");
		}

		let user = await User.findById(id);
		if (!user) {
			return fail("Invalid user!");
		}

		const emailVerified = await this.verifyEmail(
			{
				email,
				verificationCode,
			},
			false
		);
		if (emailVerified.status === -1) {
			return emailVerified;
		}

		// verification ok
		// if they were in wait list, delete them from wait list
		await User.deleteMany({ email, inWaitList: true });

		// update password
		const newPassword = createHashedPasswordFromPlainText(password);
		user = await User.findOneAndUpdate(
			{ _id: id },
			{ password: newPassword, emailVerified: true },
			{ new: true }
		);

		return success("Password was set successfully.", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.choosePreferedLanguage = async (params) => {
	if (!params.id) {
		return fail("invalid user id", params);
	}

	if (!params.language) {
		return fail("No language was selected!");
	}

	const language = languages.find((element) => element._id === params.language);

	if (!language) {
		return fail("invalid language was selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: params.id },
		{
			preferedLanguage: language,
		},
		{ new: true }
	);

	return success("Category preferences updated successfully!", user);
};

exports.updateProfile = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id", params);
		}

		if (!params.firstName) {
			return fail("Please consider setting a first name!", params);
		}

		if (!params.lastName) {
			return fail("Please consider setting a last name!", params);
		}

		// check mobile is and valid and unique
		if (!validateMobile(params.mobile)) {
			return fail("Enter a valid mobile phone!", params);
		}

		// check phone is available
		const mobileExists = await User.findOne({
			mobile: params.mobile,
			mobileVerified: true,
			_id: { $ne: id },
		});
		if (mobileExists) {
			return fail("This phone number is already in use!", params);
		}

		let user = await User.findById(id);

		if (!user.mobileVerified || user.mobile !== params.mobile) {
			createMobileVerification(params.mobile);
			params["mobileVerified"] = false;
		}

		if (params.gender) {
			const gender = genders.find((element) => element._id === params.gender);
			if (!gender) {
				return fail("invalid gender was selected!", params);
			}
			params.gender = gender;
		}

		if (params.education) {
			const education = educations.find(
				(element) => element._id === params.education
			);
			if (!education) {
				return fail("invalid education was selected", params);
			}
			params.education = education;
		}

		user = await User.findOneAndUpdate(
			{ _id: id },
			{
				...params,
			},
			{ new: true }
		);

		delete user["password"];

		return success(
			"Thank you for updating your profile information. Verification message has been sent to your phone.",
			user
		);
	} catch (e) {
		return handleException(e);
	}
};

exports.chooseCategoryPreferences = async (params) => {
	const idParam = params.id;
	const categoriesParam = params.categories;

	if (!idParam) {
		return fail("invalid user id", params);
	}

	if (!categoriesParam || categoriesParam.length === 0) {
		return fail("No categories were selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: idParam },
		{
			preferedCategories: categoriesParam,
		},
		{ new: true }
	);

	return success("Category preferences updated successfully!", user);
};

exports.chooseAccountType = async (params) => {
	const { id: idParam, accountType: accountTypeParam } = params;

	if (!idParam) {
		return fail("invalid user id", params);
	}

	if (!accountTypeParam) {
		return fail("No account type was selected!");
	}

	const accountType = await AccountType.findById(accountTypeParam);

	if (!accountType) {
		return fail("Invalid account type was selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: idParam },
		{
			accountType: { _id: accountType._id, name: accountType.name },
			hasCompletedSignup: true,
			isActive: true,
		},
		{ new: true }
	);

	return success("Account type updated successfully!", user);
};

exports.verifyEmail = async (params, updateUser = true) => {
	try {
		const { email } = params;
		// check email is valid
		if (!validateEmail(email)) {
			return fail("invalid email address!", params);
		}

		if (!params.verificationCode) {
			return fail("invalid verification code!", params);
		}

		const verifications = await Verification.find({
			type: "email",
			target: email,
			verificationCode: params.verificationCode,
			isVerified: false,
		})
			.sort({ createdAt: -1 })
			.allowDiskUse();

		if (
			verifications.length === 0 ||
			moment().isAfter(verifications[0].validUnitl)
		) {
			return fail("The verification code you provided is incorrect!", params);
		}

		await Verification.findOneAndUpdate(
			{ _id: verifications[0]._id },
			{ isVerified: true }
		);

		if (updateUser) {
			const users = await User.find({ email })
				.sort({ createdAt: -1 })
				.allowDiskUse();

			await User.findOneAndUpdate(
				{ _id: users[0]._id },
				{ emailVerified: true }
			);
		}

		return success("Thank you!", params);
	} catch (e) {
		return handleException(e);
	}
};

exports.verifyMobile = async (params, updateUser = true) => {
	try {
		const { mobile } = params;
		// check mobile is valid
		if (!validateMobile(mobile)) {
			return fail("invalid mobile number!", params);
		}

		if (!params.verificationCode) {
			return fail("invalid verification code!", params);
		}

		const verifications = await Verification.find({
			type: "mobile",
			target: mobile,
			verificationCode: params.verificationCode,
			isVerified: false,
		})
			.sort({ createdAt: -1 })
			.allowDiskUse();

		if (
			verifications.length === 0 ||
			moment().isAfter(verifications[0].validUnitl)
		) {
			return fail("The verification code you provided is incorrect!", params);
		}

		await Verification.findOneAndUpdate(
			{ _id: verifications[0]._id },
			{ isVerified: true }
		);

		if (updateUser) {
			const users = await User.find({ mobile })
				.sort({ createdAt: -1 })
				.allowDiskUse();

			await User.findOneAndUpdate(
				{ _id: users[0]._id },
				{ mobileVerified: true }
			);
		}

		return success("Thank you!", params);
	} catch (e) {
		return handleException(e);
	}
};

exports.resendEmail = async (params) => {
	// check email is valid
	if (!validateEmail(params.email)) {
		return fail("invalid email address!", params);
	}

	// send verification code to email
	return await createEmailVerification(params.email);
};

exports.resendMobile = async (params) => {
	// check mobile is valid
	if (!validateMobile(params.mobile)) {
		return fail("invalid mobile number", params);
	}

	// send verification codes to email
	return await createMobileVerification(params.mobile);
};

exports.forgotPasswordViaEmail = async (params) => {
	// check email is valid
	if (!validateEmail(params.email)) {
		return fail("invalid email address!", params);
	}

	// check if this email has a valid user
	const user = await User.findOne({ email: params.email });
	if (!user) {
		return fail("This email address does not exist in our database!");
	}

	// send verification code to email
	return createEmailVerification(params.email);
};

exports.forgotPasswordViaMobile = async (params) => {
	// check mobile is valid
	if (!validateMobile(params.mobile)) {
		return fail("invalid mobile number", params);
	}

	// check if this mobile has a valid user
	const user = await User.findOne({ mobile: params.mobile });
	if (!user) {
		return fail("This mobile number does not exist in our database!");
	}

	// send verification code to mobile
	return createMobileVerification(params.mobile);
};

exports.updatePasswordThroughEmail = async (params) => {
	const { email, verificationCode, password, passwordConfirmation } = params;
	if (!password) {
		return fail("please enter a new password!");
	}

	if (!passwordConfirmation) {
		return fail("please enter password confirmation!");
	}

	if (password !== passwordConfirmation) {
		return fail("password and password confirmation does not match!");
	}

	// check if this email has a valid user
	const user = await User.findOne({ email, emailVerified: true });
	if (!user) {
		return fail("This email address does not exist in our database!");
	}

	const emailVerified = await this.verifyEmail({ email, verificationCode });
	if (emailVerified.status === -1) {
		return emailVerified;
	}

	// verification ok
	// update password
	const newPassword = createHashedPasswordFromPlainText(password);
	await User.findOneAndUpdate(
		{ email, $or: [{ inWaitList: { $exists: false } }, { inWaitList: false }] },
		{ password: newPassword }
	);

	return success("Password was updated successfully. Please login now!");
};

exports.updatePasswordThroughMobile = async (params) => {
	const { mobile, verificationCode, password, passwordConfirmation } = params;
	if (!password) {
		return fail("please enter a new password!");
	}

	if (!passwordConfirmation) {
		return fail("please enter password confirmation!");
	}

	if (password !== passwordConfirmation) {
		return fail("password and password confirmation does not match!");
	}

	// check if this mobile has a valid user
	const user = await User.findOne({ mobile, mobileVerified: true });
	if (!user) {
		return fail("This mobile address does not exist in our database!");
	}

	const mobileVerified = await this.verifyMobile({ mobile, verificationCode });
	if (mobileVerified.status === -1) {
		return mobileVerified;
	}

	// verification ok
	// update password
	const newPassword = createHashedPasswordFromPlainText(password);
	await User.findOneAndUpdate(
		{
			mobile,
			$or: [{ inWaitList: { $exists: false } }, { inWaitList: false }],
		},
		{ password: newPassword }
	);

	return success("Password was updated successfully. Please login now!");
};

const createEmailVerification = async (email) => {
	const NEXT_VERIFICATION_MINUTES = await Setting.findOne({
		key: "NEXT_VERIFICATION_MINUTES",
	});
	// check latest verification
	const verifications = await Verification.find({
		type: "email",
		target: email,
	})
		.sort({ createdAt: -1 })
		.allowDiskUse();

	if (
		verifications.length > 0 &&
		moment().isBefore(verifications[0].validUnitl)
	) {
		const wait = moment.duration(-moment().diff(verifications[0].validUnitl));
		return fail(
			`You have to wait ${wait.as(
				"seconds"
			)} seconds for your next verification`,
			email
		);
	}

	const verification = new Verification({
		type: "email",
		target: email,
		verificationCode: "1111", // getRandomInt(999, 9999),
		createdAt: moment(),
		validUnitl: moment().add(NEXT_VERIFICATION_MINUTES.value, "m"),
		isVerified: false,
	});

	verification.save();

	// send email

	return success("Verification code was sent to you!");
};

const createMobileVerification = async (mobile) => {
	const NEXT_VERIFICATION_MINUTES = await Setting.findOne({
		key: "NEXT_VERIFICATION_MINUTES",
	});
	// check latest verification
	const verifications = await Verification.find({
		type: "mobile",
		target: mobile,
	})
		.sort({ createdAt: -1 })
		.allowDiskUse();

	if (
		verifications.length > 0 &&
		moment().isBefore(verifications[0].validUnitl)
	) {
		const wait = moment.duration(-moment().diff(verifications[0].validUnitl));
		return fail(
			`You have to wait ${wait.as(
				"seconds"
			)} seconds for your next verification`,
			mobile
		);
	}

	const verification = new Verification({
		type: "mobile",
		target: mobile,
		verificationCode: "1111", // getRandomInt(999, 9999),
		createdAt: moment(),
		validUnitl: moment().add(NEXT_VERIFICATION_MINUTES.value, "m"),
		isVerified: false,
	});

	verification.save();

	// send sms

	return success("Verification code was sent to you!");
};

exports.signout = (params) => {
	return success("user signed out successfully!");
};