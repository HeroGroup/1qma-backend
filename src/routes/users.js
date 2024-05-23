const express = require("express");
const router = express.Router();

const { getUsers } = require("../controllers/UserController");

/**
 * @openapi
 * '/admin/users':
 *  get:
 *     tags:
 *     - Admin
 *     - Users
 *     summary: get all users
 */
router.get("/", async (req, res) => {
	res.json(await getUsers());
});

module.exports = router;
