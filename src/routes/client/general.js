const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");
const { hasCompletedSignup } = require("../../middlewares/hasCompletedSignup");
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
	listQuestions,
	bookmarkQuestion,
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
	res.json(await init(req.session.user._id));
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
	const updateProfileResult = await updateProfile(req.body);
	if (updateProfileResult.status === 1) {
		req.session.user = updateProfileResult.data;
	}
	res.json(updateProfileResult);
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
	const updateUserSettingsResult = await updateUserSettings(req.body);
	if (updateUserSettingsResult.status === 1) {
		req.session.user = updateUserSettingsResult.data;
	}
	res.json(updateUserSettingsResult);
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
		const updateProfilePictureResult = await updateProfilePicture(
			req.body,
			req.file
		);
		if (updateProfilePictureResult.status === 1) {
			req.session.user = updateProfilePictureResult.data;
		}
		res.json(updateProfilePictureResult);
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
	const removeProfilePictureResult = await removeProfilePicture(req.body);
	if (removeProfilePictureResult.status === 1) {
		req.session.user = removeProfilePictureResult.data;
	}
	res.json(removeProfilePictureResult);
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
 * '/client/questions':
 *  get:
 *     tags:
 *     - Client
 *     summary: search for questions (public, private, bookmarked)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get("/questions", hasCompletedSignup, async (req, res) => {
	res.json(await listQuestions(req.session.user._id, req.query));
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

/**
 * @openapi
 * '/client/questions/bookmark':
 *  post:
 *     tags:
 *     - Client
 *     summary: Bookmark a question
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - questionId
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              questionId:
 *                type: string
 *                default: 63738495886737657388948
 */
router.post("/questions/bookmark", sameUser, async (req, res) => {
	res.json(await bookmarkQuestion(req.body));
});

module.exports = router;
