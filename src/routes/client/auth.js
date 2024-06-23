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
	registerWithInvitationLink,
} = require("../../controllers/Client/AuthController");

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
	passport.authenticate("local"),
	async (req, res) => {
		res.json(success("successfull login!", req.user));
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
router.post("/joinToWaitListWithEmailAndMobile", async (req, res) => {
	res.json(await joinToWaitListWithEmailAndMobile(req.body));
});

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
router.post("/registerWithReferal", async (req, res) => {
	res.json(await registerWithReferal(req.body));
});

router.get("/registerWithInvitationLink", async (req, res) => {
	res.json(await registerWithInvitationLink(req.body));
});

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
router.post("/setEmail", async (req, res) => {
	res.json(await setEmail(req.body));
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
router.post("/setPassword", async (req, res) => {
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
router.post("/updateLanguagePreference", async (req, res) => {
	res.json(await choosePreferedLanguage(req.body));
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
router.post("/updateProfile", async (req, res) => {
	res.json(await updateProfile(req.body));
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
 *                default: [1, 3]
 */
router.post("/updateCategoryPreferences", async (req, res) => {
	res.json(await chooseCategoryPreferences(req.body));
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
 *                type: string
 *                default: 1
 */
router.post("/updateAccountType", async (req, res) => {
	res.json(await chooseAccountType(req.body));
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
	res.json(await resendEmail(req.body));
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
		res.json(await forgotPasswordViaEmail(params));
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
 * '/auth/signout':
 *  post:
 *     tags:
 *     - Authentication
 *     summary: sign out user
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
router.post("/signout", (req, res) => {
	req.logout(function (err) {
		if (err) {
			res.json(fail(err));
		}
		res.json(success("user signed out successfully!"));
	});
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
	passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `http://localhost:4200/#/social/callback?provider_id=&error_message=failed_to_login_via_google`,
		failWithError: true,
	}),
	(req, res) => {
		const { _id, providerId, email, emailVerified } = req.user;
		const redirect = `http://localhost:4200/#/social/callback?user_id=${_id}&provider=google&provider_id=${providerId}&email=${email}&email_verified=${emailVerified}`;

		res.redirect(redirect);
	}
);

module.exports = router;
