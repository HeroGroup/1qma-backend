const { sanitize } = require("../validator");
const {
	joinToWaitList,
	registerWithReferal,
	updateProfile,
	verifyEmail,
	verifyMobile,
	resendEmail,
	resendMobile,
	loginWithEmail,
	updatePasswordThroughEmail,
	updatePasswordThroughMobile,
	init,
	forgotPasswordViaEmail,
	forgotPasswordViaMobile,
	signout,
	chooseCategoryPreferences,
	chooseAccountType,
} = require("../controllers/AuthController");

exports.authRoutes = (app) => {
	// sanitize middleware
	app.use((req, res, next) => {
		// sanitize inputs
		const { body: params } = req;
		const paramNames = Object.keys(params);
		paramNames.forEach((elm) => {
			req.body[elm] = sanitize(params[elm]);
		});

		next();
	});

	/**
	 * @openapi
	 * '/auth/register/init':
	 *  get:
	 *     tags:
	 *     - Authentication
	 *     summary: Parameters needed to be initialized
	 */
	app.get("/auth/register/init", (req, res) => {
		res.json(init());
	});

	/**
	 * @openapi
	 * '/auth/joinToWaitList':
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
	app.post("/auth/joinToWaitList", async (req, res) => {
		res.json(await joinToWaitList(req.body));
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
	app.post("/auth/registerWithReferal", async (req, res) => {
		res.json(await registerWithReferal(req.body));
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
	app.post("/auth/loginWithEmail", async (req, res) => {
		res.json(await loginWithEmail(req.body));
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
	 *              birthdate:
	 *                type: string
	 *                default: 1988/03/21
	 *              country:
	 *                type: string
	 *                default: IR
	 *              city:
	 *                city: string
	 *                default: shiraz
	 */
	app.post("/auth/updateProfile", async (req, res) => {
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
	app.post("/auth/updateCategoryPreferences", async (req, res) => {
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
	app.post("/auth/updateAccountType", async (req, res) => {
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
	app.post("/auth/verify/:type", async (req, res) => {
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
	app.post("/auth/email/resend", async (req, res) => {
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
	app.post("/auth/mobile/resend", async (req, res) => {
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
	app.post("/auth/forgotPassword/:media", async (req, res) => {
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
	app.post("/auth/updatePassword/:media", async (req, res) => {
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
	app.post("/auth/signout", (req, res) => {
		res.json(signout(req.body));
	});
};
