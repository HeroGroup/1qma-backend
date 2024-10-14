const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
	init,
	joinToWaitListWithEmailAndMobile,
	joinToWaitListWithMobile,
	registerWithReferal,
	setEmail,
	verifyEmail,
	setPassword,
	choosePreferedLanguage,
	updateProfile,
	verifyMobile,
	chooseCategoryPreferences,
	chooseAccountType,
	resendEmail,
	resendMobile,
	updatePasswordThroughEmail,
	updatePasswordThroughMobile,
	forgotPasswordViaEmail,
	forgotPasswordViaMobile,
	loginWithEmail,
	answerFurtherQuestions,
	registerWithInvitationLink,
} = require("../../controllers/Client/AuthController");
const { sameUser } = require("../../middlewares/sameUser");
const { notLoggedIn } = require("../../middlewares/notLoggedIn");

/**
 * @openapi
 * '/auth/register/init':
 *  get:
 *     tags:
 *     - Authentication
 *     summary: Parameters needed to be initialized
 */
router.get("/register/init", async (req, res) => {
	res.json(await init());
});

/**
 * @openapi
 * '/auth/loginWithEmail':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: user logins with email and password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              password:
 *                type: string
 *                default: somepassword
 */
router.post(
	"/loginWithEmail",
	/*notLoggedIn,*/ async (req, res) => {
		const loginWithEmailResult = await loginWithEmail(req.body);
		if (loginWithEmailResult.status === 1) {
			req.session.user = loginWithEmailResult.data;
		}

		res.json(loginWithEmailResult);
	}
);

/**
 * @openapi
 * '/auth/joinToWaitListWithEmailAndMobile':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: User requests to join to waiting list
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - mobile
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              mobile:
 *                type: string
 *                default: +989177048781
 */
router.post(
	"/joinToWaitListWithEmailAndMobile",
	notLoggedIn,
	async (req, res) => {
		res.json(
			await joinToWaitListWithEmailAndMobile(
				req.body,
				req.session.user?.preferedLanguage.code
			)
		);
	}
);

/**
 * @openapi
 * '/auth/joinToWaitListWithMobile':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: User requests to join to waiting list
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - mobile
 *            properties:
 *              id:
 *                type: string
 *                default: 6743850756473839
 *              mobile:
 *                type: string
 *                default: +989177048781
 */
router.post("/joinToWaitListWithMobile", async (req, res) => {
	res.json(await joinToWaitListWithMobile(req.body));
});

/**
 * @openapi
 * '/auth/registerWithReferal':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: register user with refer code
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - referer
 *            properties:
 *              referer:
 *                type: string
 *                default: 731086912583
 */
router.post(
	"/registerWithReferal",
	/*notLoggedIn,*/ async (req, res) => {
		const registerResult = await registerWithReferal(req.body);
		if (registerResult.status === 1) {
			req.session.user = registerResult.data;
		}

		res.json(registerResult);
	}
);

/**
 * @openapi
 * '/auth/registerWithInvitationLink':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: check if invitation link is valid
 */
router.post(
	"/registerWithInvitationLink",
	/*notLoggedIn, */ async (req, res) => {
		res.json(await registerWithInvitationLink(req.body.id));
	}
);

/**
 * @openapi
 * '/auth/setEmail':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: set email
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                default: 65784920294752128349
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *     parameters:
 *      - in: path
 */
router.post("/setEmail", sameUser, async (req, res) => {
	const setEmailResult = await setEmail(
		req.body,
		req.session.user?.preferedLanguage.code
	);
	if (setEmailResult.status === 1) {
		req.session.user = setEmailResult.data.user;
	}
	res.json(setEmailResult);
});

/**
 * @openapi
 * '/auth/setPassword':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: set password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                default: 65784920294752128349
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              verificationCode:
 *                type: string
 *                default: 1111
 *              password:
 *                type: string
 *                default: somepassword
 *              passwordConfirmation:
 *                type: string
 *                default: somepassword
 *     parameters:
 *      - in: path
 */
router.post("/setPassword", sameUser, async (req, res) => {
	res.json(await setPassword(req.body));
});

/**
 * @openapi
 * '/auth/updateLanguagePreference':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: udate user language preference
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - language
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              provider:
 *                type: string
 *                default: google
 *              providerId:
 *                type: string
 *                default: 224637568734659835943594
 *              language:
 *                type: string
 *                default: en
 */
router.post("/updateLanguagePreference", sameUser, async (req, res) => {
	const choosePreferedLanguageResult = await choosePreferedLanguage(req.body);
	if (choosePreferedLanguageResult.status === 1) {
		req.session.user = choosePreferedLanguageResult.data;
	}
	res.json(choosePreferedLanguageResult);
});

/**
 * @openapi
 * '/auth/updateProfile':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: user logins with email and password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - firstName
 *              - lastName
 *              - email
 *              - mobile
 *              - password
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              firstName:
 *                type: string
 *                default: Navid
 *              lastName:
 *                type: string
 *                default: Hero
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              mobile:
 *                type: string
 *                default: +989177048781
 *              password:
 *                type: string
 *                default: somepassword
 *              gender:
 *                type: string
 *                default: male
 *              education:
 *                type: string
 *                default: Bachelor
 *              country:
 *                type: string
 *                default: IR
 *              city:
 *                city: string
 *                default: shiraz
 */
router.post("/updateProfile", sameUser, async (req, res) => {
	const updateProfileResult = await updateProfile(req.body);
	if (updateProfileResult.status === 1) {
		req.session.user = updateProfileResult.data;
	}
	res.json(updateProfileResult);
});

/**
 * @openapi
 * '/auth/updateCategoryPreferences':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: register wizard step 2
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - categories
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              categories:
 *                type: array
 *                default: [{_id: "6543234567890", name: "history"}]
 */
router.post("/updateCategoryPreferences", sameUser, async (req, res) => {
	const chooseCategoryPreferencesResult = await chooseCategoryPreferences(
		req.body
	);
	if (chooseCategoryPreferencesResult.status === 1) {
		req.session.user = chooseCategoryPreferencesResult.data;
	}
	res.json(chooseCategoryPreferencesResult);
});

/**
 * @openapi
 * '/auth/answerFurtherQuestions':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: register wizard step 3
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - answers
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              answers:
 *                type: array
 *                default: [{_id: "675638942659346598643", question: "what is your hobby?", answer: "I rather watch TV"}, {_id: "6543234567890", question: "which options best suit you?", answer: ["athlete", "animal lover"]}]
 */
router.post("/answerFurtherQuestions", sameUser, async (req, res) => {
	const answerFurtherQuestionsResult = await answerFurtherQuestions(req.body);
	if (answerFurtherQuestionsResult.status === 1) {
		req.session.user = answerFurtherQuestionsResult.data;
	}
	res.json(answerFurtherQuestionsResult);
});

/**
 * @openapi
 * '/auth/updateAccountType':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: register wizard step 4
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - accountType
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              accountType:
 *                type: object
 *                default: {_id: "87654567898765", name: "Basic"}
 */
router.post("/updateAccountType", sameUser, async (req, res) => {
	const chooseAccountTypeResult = await chooseAccountType(req.body);
	if (chooseAccountTypeResult.status === 1) {
		req.session.user = chooseAccountTypeResult.data;
	}
	res.json(chooseAccountTypeResult);
});

/**
 * @openapi
 * '/auth/verify/{type}':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: very email or mobile
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - verificationCode
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              mobile:
 *                type: string
 *                default: +989177048781
 *              verificationCode:
 *                type: string
 *                default: 1111
 *     parameters:
 *      - in: path
 */
router.post("/verify/:type", async (req, res) => {
	const { body: params } = req;
	const type = req.params.type;

	if (type === "email") {
		res.json(await verifyEmail(params));
	} else if (type === "mobile") {
		res.json(await verifyMobile(params));
	} else {
		res.json({ status: -1, message: "invalid media" });
	}
});

/**
 * @openapi
 * '/auth/email/resend':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: resend verification code to email
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 */
router.post("/email/resend", async (req, res) => {
	res.json(
		await resendEmail(req.body, req.session.user?.preferedLanguage.code)
	);
});

/**
 * @openapi
 * '/auth/mobile/resend':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: resend verification code to mobie
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - mobile
 *            properties:
 *              mobile:
 *                type: string
 *                default: +989177048781
 */
router.post("/mobile/resend", async (req, res) => {
	res.json(await resendMobile(req.body));
});

/**
 * @openapi
 * '/auth/forgotPassword/{media}':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: recover forgotten password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              mobile:
 *                type: string
 *                default: +989177048781
 *     parameters:
 *      - in: path
 */
router.post("/forgotPassword/:media", async (req, res) => {
	const { body: params } = req;
	const media = req.params.media;

	if (media === "email") {
		res.json(
			await forgotPasswordViaEmail(
				params,
				req.session.user?.preferedLanguage.code
			)
		);
	} else if (media === "mobile") {
		res.json(await forgotPasswordViaMobile(params));
	} else {
		res.json({ status: -1, message: "invalid media" });
	}
});

/**
 * @openapi
 * '/auth/updatePassword/{media}':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: set new password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              mobile:
 *                type: string
 *                default: +989177048781
 *              verificationCode:
 *                type: string
 *                default: 1111
 *              password:
 *                type: string
 *                default: somepassword
 *              passwordConfirmation:
 *                type: string
 *                default: somepassword
 *     parameters:
 *      - in: path
 */
router.post("/updatePassword/:media", async (req, res) => {
	const { body: params } = req;
	const media = req.params.media;

	if (media === "email") {
		res.json(await updatePasswordThroughEmail(params));
	} else if (media === "mobile") {
		res.json(await updatePasswordThroughMobile(params));
	} else {
		res.json({ status: -1, message: "invalid media" });
	}
});

/**
 * @openapi
 * '/auth/logout':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: log out user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 */
router.post("/logout", sameUser, async (req, res) => {
	req.session.user = {};

	req.logout(function (err) {
		if (err) {
			res.json(fail(err));
		}
	});

	res.json(success("user logged out successfully!"));
});

/**
 * @openapi
 * '/auth/google':
 *  get:
 *     tags:
 *     - Authentication
 *     summary: Authenticate with google
 */
router.get(
	"/google",
	(req, res, next) => {
		req.session.reason = req.query.reason;
		next();
	},
	passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
	let redirect = env.authServiceProviders.successRedirectUrl;

	if (req.user.status === 1) {
		console.info("success google callback");
		const { _id, providerId, email, emailVerified } = req.user.data;
		redirect += `?user_id=${_id}&provider=google&provider_id=${providerId}&email=${email}&email_verified=${emailVerified}&status=1`;
		req.session.user = req.user.data;
	} else {
		const message = req.user.message;
		const reason = req.user.data;
		const frontAppUrl = env.frontAppUrl;

		if (reason === "join_to_wait_list") {
			redirect = `${frontAppUrl}/signup?status=-1&message=${message}`;
		} else if (reason === "login") {
			redirect = `${frontAppUrl}/login?status=-1&message=${message}`;
		} else {
			redirect = `${frontAppUrl}/signup-refer-email?status=-1&message=${message}`;
		}
	}

	// clear auth result stored in req.user
	// req.logout((err) => {});
	res.redirect(redirect);
});

/**
 * @openapi
 * '/auth/facebook':
 *  get:
 *     tags:
 *     - Authentication
 *     summary: Authenticate with facebook
 */
router.get(
	"/facebook",
	(req, res, next) => {
		req.session.reason = req.query.reason;
		next();
	},
	passport.authenticate("facebook")
);

router.get(
	"/facebook/callback",
	passport.authenticate("facebook"),
	(req, res) => {
		let redirect = env.authServiceProviders.facebook.successRedirectUrl;

		if (req.user.status === 1) {
			const { _id, providerId, email, emailVerified } = req.user.data;
			redirect += `?user_id=${_id}&provider=facebook&provider_id=${providerId}&email=${email}&email_verified=${emailVerified}&status=1`;
			req.session.user = req.user.data;
		} else {
			const message = req.user.message;
			const reason = req.user.data;
			const frontAppUrl = env.frontAppUrl;

			if (reason === "join_to_wait_list") {
				redirect = `${frontAppUrl}/#/signup?status=-1&message=${message}`;
			} else if (reason === "login") {
				redirect = `${frontAppUrl}/#/login?status=-1&message=${message}`;
			} else {
				redirect = `${frontAppUrl}/#/signup-refer-email?status=-1&message=${message}`;
			}
		}

		// clear auth result stored in req.user
		// req.logout((err) => {});
		res.redirect(redirect);
	}
);

/**
 * @openapi
 * '/auth/{id}/details}':
 *  get:
 *     tags:
 *     - Authentication
 *     summary: Get User Details
 */
router.get("/:id/details", sameUser, (req, res) => {
	res.json(success("ok", req.session.user));
});

module.exports = router;
