const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");
const { sameUser } = require("../../middlewares/sameUser");

const {
	init,
	updateProfile,
	updateUserSettings,
	updateProfilePicture,
	removeProfilePicture,
	userDetails,
	invite,
	addQuestion,
} = require("../../controllers/Client/ClientController");

/**
 * @openapi
 * '/client/init':
 *  get:
 *     tags:
 *     - Client
 *     summary: Parameters needed to be initialized
 */
router.get("/init", async (req, res) => {
	const initResult = await init();
	if (initResult.status === 1) {
		initResult.data.user = req.session.user;
	}
	res.json(initResult);
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
 *              accountType:
 *                type: string
 *                default: 6758323993485732626
 */
router.post("/profile/update", sameUser, async (req, res) => {
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
router.post("/settings/update", sameUser, async (req, res) => {
	res.json(await updateUserSettings(req.body));
});

/**
 * @openapi
 * '/client/profilePicture/update':
 *  post:
 *     tags:
 *     - Client
 *     summary: updates user profile picture
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - avatar
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              avatar:
 *                type: string
 *                format: binary
 */
router.post(
	"/profilePicture/update",
	imageUpload.single("avatar"),
	sameUser,
	async (req, res) => {
		res.json(await updateProfilePicture(req.body, req.file));
	}
);

/**
 * @openapi
 * '/client/profilePicture/remove':
 *  post:
 *     tags:
 *     - Client
 *     summary: removes user profile picture
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
 *                default: 63738495886737657388948
 */
router.post("/profilePicture/remove", sameUser, async (req, res) => {
	res.json(await removeProfilePicture(req.body));
});

/**
 * @openapi
 * '/client/{id}/details':
 *  get:
 *     tags:
 *     - Client
 *     summary: Get user details
 */
router.get("/:id/details", async (req, res) => {
	res.json(await userDetails(req.params.id));
});

/**
 * @openapi
 * '/client/invite':
 *  post:
 *     tags:
 *     - Client
 *     summary: invite via email
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - email
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              email:
 *                type: string
 *                format: navid@gmail.com
 */
router.post("/invite", sameUser, async (req, res) => {
	res.json(await invite(req.body));
});

/**
 * @openapi
 * '/client/questions/add':
 *  post:
 *     tags:
 *     - Client
 *     summary: Add some question and answer to private library
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - category
 *              - question
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              category:
 *                type: String
 *                default: 6543234567890
 *              question:
 *                type: string
 *                format: Why apple stopped developing Apple Car?
 *              answer:
 *                type: string
 *                format: I do not know
 */
router.post("/questions/add", sameUser, async (req, res) => {
	res.json(await addQuestion(req.body));
});

module.exports = router;
