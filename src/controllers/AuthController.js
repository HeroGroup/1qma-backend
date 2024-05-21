const bcrypt = require("bcrypt");
const { validateEmail, validateMobile } = require("../validator");
const {
	handleException,
	getRandomInt,
	createHashedPasswordFromPlainText,
} = require("../utils");
const User = require("../models/User");
const Verification = require("../models/Verification");
const NEXT_VERIFICATION_MINUTES = env.nextVerificationMinutes;

exports.init = () => {
	return {
		status: 1,
		message: "initialize parametes",
		data: {
			languages: {
				en: "English",
			},
			categories: {
				1: "History",
				2: "Psychology",
				3: "Geography",
				4: "blah",
				5: "blah",
				6: "blah",
				7: "Free Discussion",
			},
			accountTypes: {
				1: "Basic",
				2: "Educational",
				3: "Bussiness",
			},
			nextVerificationMinutes: NEXT_VERIFICATION_MINUTES,
			furthurQuestions: {
				1: {
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
				2: {
					question: "Maritial Status",
					type: "single_option",
					options: {
						1: "single",
						2: "married",
						3: "separated",
						4: "prefer not to say",
					},
				},
			},
		},
	};
};

exports.joinToWaitList = async (params) => {
	// check email is valid
	if (!validateEmail(params.email)) {
		return fail("invalid email address!", params);
	}

	// check mobile is present and valid
	if (!validateMobile(params.mobile)) {
		return fail("Enter a valid mobile phone!", params);
	}

	// check email is available
	const emailExists = await User.findOne({ email: params.email });
	if (emailExists) {
		return fail("This email address is already in use!", params);
	}

	// check phone is available
	const mobileExists = await User.findOne({ mobile: params.mobile });
	if (mobileExists) {
		return fail("This phone number is already in use!", params);
	}

	// send verification codes to email and mobile
	createEmailVerification(params.email);
	createMobileVerification(params.mobile);

	return success("Verification code was sent to you!", params);
};

exports.registerWithReferal = async (params) => {
	try {
		const refererUser = await User.findOne({ referCode: params.referer });

		if (!refererUser) {
			return fail("unknown referer!", params);
		}

		// TODO: check number of people refered

		const newUser = new User({
			referCode: `${getRandomInt(999, 9999)}${getRandomInt(
				999,
				9999
			)}${getRandomInt(999, 9999)}`,
			referer: refererUser._id,
			isActive: false,
			hasCompletedSignup: false,
			created_at: moment(),
		});

		await newUser.save();

		return success("New User was created successfully!", newUser);
	} catch (e) {
		return handleException(e);
	}
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

		const user = await User.findOne({ email: params.email });
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

exports.choosePreferedLanguage = async (params) => {
	if (!params.id) {
		return fail("invalid user id", params);
	}

	if (!params.language) {
		return fail("No language was selected!");
	}

	if (!["en"].includes(params.language)) {
		return fail("invalid language was selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: params.id },
		{
			preferedLanguage: params.language,
		},
		{ new: true }
	);

	return success("Category preferences updated successfully!", user);
};

exports.updateProfile = async (params) => {
	try {
		if (!params.id) {
			return fail("invalid user id", params);
		}

		if (!params.firstName) {
			return fail("Please consider setting a first name!", params);
		}

		if (!params.lastName) {
			return fail("Please consider setting a last name!", params);
		}

		params.password = createHashedPasswordFromPlainText(params.password);

		// check email is valid and unique
		if (!validateEmail(params.email)) {
			return fail("invalid email address!", params);
		}

		// check mobile is and valid and unique
		if (!validateMobile(params.mobile)) {
			return fail("Enter a valid mobile phone!", params);
		}

		// check email is available
		const emailExists = await User.findOne({
			email: params.email,
			emailVerified: true,
			_id: { $ne: params.id },
		});
		if (emailExists) {
			return fail("This email address is already in use!", params);
		}

		// check phone is available
		const mobileExists = await User.findOne({
			mobile: params.mobile,
			mobileVerified: true,
			_id: { $ne: params.id },
		});
		if (mobileExists) {
			return fail("This phone number is already in use!", params);
		}

		let user = await User.findById(params.id);

		if (!user.password && !params.password) {
			return fail("Please consider setting a password!", params);
		}

		const update = {};
		// send verification codes
		if (!user.emailVerified || user.email !== params.email) {
			createEmailVerification(params.email);
			update["emailVerified"] = false;
		}
		if (!user.mobileVerified || user.mobile !== params.mobile) {
			createMobileVerification(params.mobile);
			update["mobileVerified"] = false;
		}

		user = await User.findOneAndUpdate(
			{ _id: params.id },
			{
				...params,
				...update,
			},
			{ new: true }
		);

		// delete user["password"];

		return success(
			"Thank you for updating your profile information. Verification messages has been sent to you.",
			user
		);
	} catch (e) {
		return handleException(e);
	}
};

exports.chooseCategoryPreferences = async (params) => {
	if (!params.id) {
		return fail("invalid user id", params);
	}

	if (!params.categories || params.categories.length === 0) {
		return fail("No categories were selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: params.id },
		{
			preferedCategories: params.categories,
		},
		{ new: true }
	);

	return success("Category preferences updated successfully!", user);
};

exports.chooseAccountType = async (params) => {
	if (!params.id) {
		return fail("invalid user id", params);
	}

	if (!params.accountType) {
		return fail("No account type was selected!");
	}

	if (!["1", "2", "3"].includes(params.accountType)) {
		return fail("Invalid account type was selected!");
	}

	const user = await User.findOneAndUpdate(
		{ _id: params.id },
		{
			accountType: params.accountType,
		},
		{ new: true }
	);

	return success("Category preferences updated successfully!", user);
};

exports.verifyEmail = async (params) => {
	try {
		// check email is valid
		if (!validateEmail(params.email)) {
			return fail("invalid email address!", params);
		}

		if (!params.verificationCode) {
			return fail("invalid verification code!", params);
		}

		const verifications = await Verification.find({
			type: "email",
			target: params.email,
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

		await User.findOneAndUpdate(
			{ email: params.email },
			{ emailVerified: true }
		);

		return success("Thank you!", params);
	} catch (e) {
		return handleException(e);
	}
};

exports.verifyMobile = async (params) => {
	try {
		// check email is valid
		if (!validateMobile(params.mobile)) {
			return fail("invalid mobile number!", params);
		}

		if (!params.verificationCode) {
			return fail("invalid verification code!", params);
		}

		const verifications = await Verification.find({
			type: "mobile",
			target: params.mobile,
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

		Verification.findOneAndUpdate(
			{ _id: verifications[0]._id },
			{ isVerified: true }
		);

		User.findOneAndUpdate({ mobile: params.mobile }, { mobilelVerified: true });

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
	const user = await User.findOne({ email });
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
	await User.findOneAndUpdate({ email }, { password: newPassword });

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
	const user = await User.findOne({ mobile });
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
	await User.findOneAndUpdate({ mobile }, { password: newPassword });

	return success("Password was updated successfully. Please login now!");
};

const createEmailVerification = async (email) => {
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
		validUnitl: moment().add(NEXT_VERIFICATION_MINUTES, "m"),
		isVerified: false,
	});

	verification.save();

	// send email

	return success("Verification code was sent to you!");
};

const createMobileVerification = async (mobile) => {
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
		validUnitl: moment().add(NEXT_VERIFICATION_MINUTES, "m"),
		isVerified: false,
	});

	verification.save();

	// send sms

	return success("Verification code was sent to you!");
};

exports.signout = (params) => {
	return success("user signed out successfully!");
};
