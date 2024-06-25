const express = require("express");
const router = express.Router();

const { isAdmin } = require("../../middlewares/isAdmin");

const {
	login,
	createAdminUser,
	dashboard,
	updatePassword,
	logout,
} = require("../../controllers/Admin/AdminController");
const {
	loginWithAuthToken,
} = require("../../controllers/Client/AuthController");

/**
 * @openapi
 * '/admin/login':
 *  post:
 *     tags:
 *     - Admin
 *     summary: admin user logins with email and password
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
 *                default: navid@1qma.games
 *              password:
 *                type: string
 *                default: admin
 */
router.post("/login", async (req, res) => {
	const loginResult = await login(req.body);
	if (loginResult.status === 1) {
		const user = await loginWithAuthToken(loginResult.data.token);
		req.session.user = user;
		loginResult.data.user = user;
	}

	res.json(loginResult);
});

// router.get("/createAdminUser", async (req, res) => {
// 	res.json(await createAdminUser(req.body));
// });

/**
 * @openapi
 * '/admin/dashboard':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get dashboard parameters
 */
router.get("/dashboard", isAdmin, async (req, res) => {
	res.json(await dashboard(req.body));
});

/**
 * @openapi
 * '/admin/updatePassword':
 *  post:
 *     tags:
 *     - Admin
 *     summary: updates admin password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - currentPassword
 *              - password
 *              - passwordConfirmation
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              currentPassword:
 *                type: string
 *                default: admin
 *              password:
 *                type: string
 *                default: newpass
 *              passwordConfirmation:
 *                type: string
 *                default: newpass
 */
router.post("/updatePassword", isAdmin, async (req, res) => {
	res.json(await updatePassword(req.body));
});

/**
 * @openapi
 * '/admin/logout':
 *  post:
 *     tags:
 *     - Admin
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
router.post("/logout", isAdmin, async (req, res) => {
	const logoutResponse = await logout(req.body.id, req.header("Access-Token"));
	if (logoutResponse.status === 1) {
		req.logout(function (err) {
			if (err) {
				res.json(fail(err));
			}
		});

		req.session.destroy();
	}

	res.json(logoutResponse);
});

module.exports = router;
