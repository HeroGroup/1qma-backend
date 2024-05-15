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
} = require("../controllers/AuthController");

exports.authRoutes = (app) => {
	// sanitize middleware
	app.use((req, res, next) => {
		// sanitize inputs
		req.body = sanitize(req.body);
		next();
	});

	app.post("/auth/joinToWaitList", async (req, res) => {
		res.json(await joinToWaitList(req.body));
	});

	app.get("/auth/register/init", (req, res) => {
		res.json(init());
	});

	app.post("/auth/registerWithReferal", async (req, res) => {
		res.json(await registerWithReferal(req.body));
	});

	app.post("/auth/loginWithEmail", async (req, res) => {
		res.json(await loginWithEmail(req.body));
	});

	// register wizard step 1
	app.post("/auth/updateProfile", async (req, res) => {
		res.json(await updateProfile(req.body));
	});

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

	app.post("/auth/email/resend", async (req, res) => {
		res.json(await resendEmail(req.body));
	});

	app.post("/auth/mobile/resend", async (req, res) => {
		res.json(await resendMobile(req.body));
	});

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
};
