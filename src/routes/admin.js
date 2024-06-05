const express = require("express");
const { login } = require("../controllers/AdminController");
const router = express.Router();

/**
 * @openapi
 * '/admin/loginWithEmail':
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
 *                default: navid@gmail.com
 *              password:
 *                type: string
 *                default: somepassword
 */
router.post("/login", async (req, res) => {
	res.json(await login(req.body));
});

module.exports = router;
