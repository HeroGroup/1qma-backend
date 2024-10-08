const { validateEmail, validateMobile } = require("../../helpers/validator");
const {
	handleException,
	getRandomInt,
	createHashedPasswordFromPlainText,
	checkSame,
	xpNeededForNextLevel,
	objectId,
} = require("../../helpers/utils");
const AccountType = require("../../models/AccountType");
const Category = require("../../models/Category");
const RegisterQuestion = require("../../models/RegisterQuestion");
const Setting = require("../../models/Setting");
const Sponsor = require("../../models/Sponsor");
const User = require("../../models/User");
const Verification = require("../../models/Verification");

const { languages, genders, educations } = require("../../helpers/constants");
const {
	createUniqueReferCode,
} = require("../../helpers/createUniqueReferCode");
const {
	createUniqueAnonymousName,
} = require("../../helpers/createUniqueAnonymousName");

exports.init = async () => {
	const shouldBeActive = { isActive: true };
	const sortCriteria = { order: 1 };

	const accountTypes = await AccountType.find(shouldBeActive).sort(
		sortCriteria
	);
	const categories = await Category.find(shouldBeActive).sort(sortCriteria);
	const furtherQuestions = await RegisterQuestion.find(shouldBeActive).sort(
		sortCriteria
	);
	const sponsors = await Sponsor.find(shouldBeActive).sort(sortCriteria);

	const NEXT_VERIFICATION_MINUTES = await Setting.findOne({
		key: "NEXT_VERIFICATION_MINUTES",
	});

	const normalGameVideoLinkSetting = await Setting.findOne({
		key: "NORMAL_GAME_VIDEO_LINK",
	});
	const normalGameExplanationSetting = await Setting.findOne({
		key: "NORMAL_GAME_EXPLANATION",
	});
	const survivalGameVideoLinkSetting = await Setting.findOne({
		key: "SURVIVAL_GAME_VIDEO_LINK",
	});
	const survivalGameExplanationSetting = await Setting.findOne({
		key: "SURVIVAL_GAME_EXPLANATION",
	});

	return success("initialize parameters", {
		languages,
		genders,
		educations,
		categories,
		accountTypes,
		nextVerificationMinutes: NEXT_VERIFICATION_MINUTES.value,
		furtherQuestions,
		sponsors,
		gameExplanations: [
			{
				gameType: "Normal Game",
				link: normalGameVideoLinkSetting?.value || "",
				explanation: normalGameExplanationSetting?.value || "",
			},
			{
				gameType: "Survival Game",
				link: survivalGameVideoLinkSetting?.value || "",
				explanation: survivalGameExplanationSetting?.value || "",
			},
		],
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
			email: { $regex: params.email, $options: "i" },
			emailVerified: true,
			isActive: true,
		});

		if (user && user.loginProvider && user.providerId) {
			return fail(
				`This email is associated with your ${user.loginProvider} account! Please use login with ${user.loginProvider} button.`
			);
		}

		if (!user || !checkSame(params.password, user.password)) {
			return fail("Invalid email and password combination!", params);
		}

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
		email: { $regex: params.email, $options: "i" },
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
		referCode: await createUniqueReferCode(),
		email: params.email.toLowerCase(),
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
	createEmailVerification(params.email.toLowerCase());
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

		const maxInvites = parseInt(refererUser.maxInvites || 5);
		const invites = refererUser.invitations?.length || 0;
		const invitesLeft = maxInvites - invites;
		if (!(invitesLeft > 0)) {
			return fail(
				"Unfortunately your referer has reached their maximum allowed invites!"
			);
		}

		const newUser = new User({
			anonymousName: await createUniqueAnonymousName(env.anonymousNameLength),
			referCode: await createUniqueReferCode(),
			referer: {
				_id: refererUser._id,
				firstName: refererUser.firstName,
				lastName: refererUser.lastName,
				profilePicture: refererUser.profilePicture,
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
			email: { $regex: email, $options: "i" },
			emailVerified: true,
			$or: [{ inWaitList: false }, { inWaitList: { $exists: false } }],
		});

		if (users > 0) {
			return fail("This email address is already in use!");
		}

		const user = await User.findOneAndUpdate(
			{ _id: id },
			{ email: email.toLowerCase(), emailVerified: false },
			{ new: true }
		);

		createEmailVerification(email.toLowerCase());

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
		{ preferedLanguage: language },
		{
			new: true,
		}
	);

	if (user.referer) {
		// update referer user
		const refererUserId = user.referer._id;
		const refererUser = await User.findById(refererUserId);

		const userInvitationIndex = refererUser.invitations.findIndex((elm) => {
			return elm._id === objectId(user._id) || elm.email === user.email;
		});

		if (userInvitationIndex === -1) {
			await User.findByIdAndUpdate(refererUserId, {
				$push: {
					invitations: {
						_id: user._id,
						email: user.email,
						createdAt: moment(),
					},
				},
			});
		}

		return success("Language preferences updated successfully!", user);
	} else {
		return success(
			"Language preferences updated successfully, but did not find referer user!",
			user
		);
	}
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

		delete user.password;

		return success(
			"Thank you for updating your profile information. Verification message has been sent to your phone.",
			user
		);
	} catch (e) {
		return handleException(e);
	}
};

exports.chooseCategoryPreferences = async (params) => {
	try {
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
	} catch (e) {
		return handleException(e);
	}
};

exports.answerFurtherQuestions = async (params) => {
	try {
		const { id, answers } = params;

		if (!id) {
			return fail("invalid user id");
		}

		if (!answers || answers.length === 0) {
			return fail("invalid questions");
		}

		const user = await User.findByIdAndUpdate(
			id,
			{ furtherQuestions: answers },
			{ new: true }
		);

		return success("Answers updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.chooseAccountType = async (params) => {
	try {
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

		const initialMaxNumberOfAllowedRefers = await Setting.findOne({
			key: "MAX_NUMBER_OF_ALLOWED_REFERS",
		});

		const defaultNumberOfBronzeCoins = await Setting.findOne({
			key: "DEFAULT_NUMBER_OF_BRONZE_COINS",
		});

		const user = await User.findOneAndUpdate(
			{ _id: idParam },
			{
				accountType: {
					_id: accountType._id,
					name: accountType.name,
					icon: accountType.icon,
					startDate: moment(),
					expireDays: 30,
				},
				hasCompletedSignup: true,
				signupCompletedAt: moment(),
				maxInvites: parseInt(initialMaxNumberOfAllowedRefers?.value || 0),
				assets: {
					coins: {
						bronze: parseInt(defaultNumberOfBronzeCoins?.value) || 0,
						silver: 0,
						gold: 0,
					},
				},
				statistics: {
					level: 0,
					currentLevelXP: 0,
					xpNeededForNextLevel: xpNeededForNextLevel(0),
					totalXP: 0,
					normal: {
						totalScore: 0,
					},
					survival: {
						checkpoint: 0, // starter
						avgRank: 0,
						avgQuestionScore: 0,
						avgScore: 0,
						loses: 0,
						rebuys: 0,
						totalScore: 0,
						adjustedScore: 0,
					},
				},
				games: {
					played: 0,
					created: 0,
					won: 0,
					highScore: 0,
					survivalGamesPlayed: 0,
				},
				hasSeenIntros: {
					dashboard: false,
					games: false,
					triviaHub: false,
					shop: false,
				},
				isActive: true,
			},
			{ new: true }
		);

		return success("Account type updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
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
			target: { $regex: email, $options: "i" },
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
			const users = await User.find({ email: { $regex: email, $options: "i" } })
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
	return await createEmailVerification(params.email.toLowerCase());
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
	const user = await User.findOne({
		email: { $regex: params.email, $options: "i" },
	});
	if (!user) {
		return fail("This email address does not exist in our database!");
	}

	if (user.loginProvider && user.providerId) {
		return fail(
			`This email is associated with your ${user.loginProvider} account! Please use login with ${user.loginProvider} button.`
		);
	}

	// send verification code to email
	return createEmailVerification(params.email.toLowerCase());
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

	if (user.loginProvider && user.providerId) {
		return fail(
			`This email is associated with your ${user.loginProvider} account! Please use login with ${user.loginProvider} button.`
		);
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
	const user = await User.findOne({
		email: { $regex: email, $options: "i" },
		emailVerified: true,
	});
	if (!user) {
		return fail("This email address does not exist in our database!");
	}

	if (user.loginProvider && user.providerId) {
		return fail(
			`This email is associated with your ${user.loginProvider} account! Please use login with ${user.loginProvider} button.`
		);
	}

	const emailVerified = await this.verifyEmail({
		email: email.toLowerCase(),
		verificationCode,
	});
	if (emailVerified.status === -1) {
		return emailVerified;
	}

	// verification ok
	// update password
	const newPassword = createHashedPasswordFromPlainText(password);
	await User.findOneAndUpdate(
		{
			email: { $regex: email, $options: "i" },
			$or: [{ inWaitList: { $exists: false } }, { inWaitList: false }],
		},
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

	if (user.loginProvider && user.providerId) {
		return fail(
			`This email is associated with your ${user.loginProvider} account! Please use login with ${user.loginProvider} button.`
		);
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
		target: { $regex: email, $options: "i" },
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
		target: email.toLowerCase(),
		verificationCode: "1111", // getRandomInt(999, 9999),
		createdAt: moment(),
		validUnitl: moment().add(NEXT_VERIFICATION_MINUTES.value, "m"),
		isVerified: false,
	});

	await verification.save();

	// TODO: send email

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

	await verification.save();

	// TODO: send sms

	return success("Verification code was sent to you!");
};

exports.googleOAuth = async (profile, userSession, reason) => {
	try {
		const tempUser = {
			loginProvider: "google",
			providerId: profile.sub,
			firstName: profile.given_name,
			lastName: profile.family_name,
			email: profile.email,
			emailVerified: profile.email_verified,
			profilePicture: profile.picture,
		};

		const normalUser = await User.findOne({
			email: profile.email,
			emailVerified: profile.email_verified,
			password: { $exists: true },
		});

		const googleUser = await User.findOne({
			loginProvider: "google",
			providerId: profile.sub,
			email: profile.email,
			emailVerified: profile.email_verified,
		});

		if (reason === "register") {
			if (googleUser && !googleUser.inWaitList) {
				return fail("This Google user is already a member!");
			} else if (normalUser && !normalUser.inWaitList) {
				return fail(
					"You have already registered with this email and a corresponding password!"
				);
			} else {
				await User.deleteMany({ email: profile.email, inWaitList: true });
				return success(
					"ok",
					await User.findOneAndUpdate(
						{
							_id: userSession._id,
							"referer._id": { $exists: true },
						},
						{
							...tempUser,
							inWaitList: false,
							isActive: true,
						},
						{ new: true }
					)
				);
			}
		} else if (reason === "join_to_wait_list") {
			if (googleUser) {
				return fail("This Google user is already a member!", reason);
			} else if (normalUser) {
				return fail(
					"You have already registered with this email and a corresponding password!",
					reason
				);
			} else {
				const newUser = new User({
					...tempUser,
					inWaitList: true,
					isActive: false,
					hasCompletedSignup: false,
					created_at: moment(),
				});

				await newUser.save();

				return success("ok", newUser);
			}
		} else if (reason === "login") {
			if (googleUser) {
				return success("ok", googleUser);
			} else if (normalUser) {
				return fail(
					"You have registered with this email and a corresponding password!",
					reason
				);
			}

			return fail(
				"There is no registered user with this email address!",
				reason
			);
		}

		return fail("No reason for google auth!");
	} catch (e) {
		handleException(e);
	}
};

exports.facebookAuth = async (profile, userSession, reason) => {
	console.log(profile, userSession, reason);
};

exports.registerWithInvitationLink = async (params) => {};

exports.logout = async (id) => {
	try {
		if (!id) {
			return fail("invalid id!");
		}

		return success("user logged out successfully!");
	} catch (e) {
		return handleException(e);
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
