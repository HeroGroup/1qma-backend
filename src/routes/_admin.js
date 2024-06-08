const express = require("express");
const {
	login,
	createAdminUser,
	dashboard,
	logout,
} = require("../controllers/AdminController");
const router = express.Router();

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
	res.json(await login(req.body));
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
router.get("/dashboard", async (req, res) => {
	res.json(await dashboard(req.body));
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
router.post("/signout", (req, res) => {
	res.json(logout(req.body));
});

module.exports = router;
