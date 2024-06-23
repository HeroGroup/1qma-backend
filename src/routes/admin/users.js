const express = require("express");
const router = express.Router();

const {
	getUsers,
	toggleActive,
	deleteUser,
} = require("../../controllers/Admin/UserController");

/**
 * @openapi
 * '/admin/users':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all users
 */
router.get("/", async (req, res) => {
	const users = await getUsers();
	res.json({ users, admin: req.user });
});

/**
 * @openapi
 * '/admin/users/toggleActive':
 *  post:
 *     tags:
 *     - Admin
 *     summary: toggle active
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - active
 *            properties:
 *              id:
 *                type: string
 *                default: 6644e9072019def5602933cb
 *              active:
 *                type: boolean
 *                default: false
 */
router.post("/toggleActive", async (req, res) => {
	res.json(await toggleActive(req.body));
});

/**
 * @openapi
 * '/admin/users/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete user
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
router.post("/delete", async (req, res) => {
	res.json(await deleteUser(req.body));
});

module.exports = router;
