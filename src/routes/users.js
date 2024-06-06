const express = require("express");
const router = express.Router();

const { getUsers, toggleActive } = require("../controllers/UserController");

/**
 * @openapi
 * '/admin/users':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all users
 */
router.get("/", async (req, res) => {
	res.json(await getUsers());
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

module.exports = router;
