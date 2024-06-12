const express = require("express");
const {
	init,
	updateProfile,
	updateUserSettings,
} = require("../../controllers/Client/ProfileController");
const router = express.Router();

/**
 * @openapi
 * '/client/init':
 *  get:
 *     tags:
 *     - Client
 *     summary: Parameters needed to be initialized
 */
router.get("/init", async (req, res) => {
	res.json(await init());
});

/**
 * @openapi
 * '/client/profile/update':
 *  post:
 *     tags:
 *     - Client
 *     summary: updates user profile
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
 *              - accountType
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              firstName:
 *                type: string
 *                default: navid
 *              lastName:
 *                type: string
 *                default: navid
 *              gender:
 *                type: string
 *                default: male
 *              education:
 *                type: string
 *                default: phD
 *              country:
 *                type: string
 *                default: Iran
 *              city:
 *                type: string
 *                default: Shiraz
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
router.post("/profile/update", async (req, res) => {
	res.json(await updateProfile(req.body));
});

/**
 * @openapi
 * '/client/settings/update':
 *  post:
 *     tags:
 *     - Client
 *     summary: updates user profile
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - language
 *              - defaultHomePage
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              language:
 *                type: string
 *                default: 0
 *              defaultHomePage:
 *                type: string
 *                default: /dashboard
 */
router.post("/settings/update", async (req, res) => {
	res.json(await updateUserSettings(req.body));
});

module.exports = router;
