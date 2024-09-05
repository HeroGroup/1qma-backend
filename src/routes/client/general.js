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
	removeBookmarkQuestion,
	likeQuestion,
	topQuestions,
	questionPerformance,
	questionsFromFriendsLatestGames,
	getTransactions,
	reportBug,
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
	res.json(
		await addQuestion(
			req.body,
			req.session.user?.preferedLanguage.code || env.defaultLanguage
		)
	);
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

/**
 * @openapi
 * '/client/questions/removeBookmark':
 *  post:
 *     tags:
 *     - Client
 *     summary: Remove Bookmark a question
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
router.post("/questions/removeBookmark", sameUser, async (req, res) => {
	res.json(await removeBookmarkQuestion(req.body));
});

/**
 * @openapi
 * '/client/questions/like':
 *  post:
 *     tags:
 *     - Client
 *     summary: like a question
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
router.post("/questions/like", sameUser, async (req, res) => {
	res.json(await likeQuestion({ ...req.body, status: 1 }));
});

/**
 * @openapi
 * '/client/questions/dislike':
 *  post:
 *     tags:
 *     - Client
 *     summary: dislike a question
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
router.post("/questions/dislike", sameUser, async (req, res) => {
	res.json(await likeQuestion({ ...req.body, status: -1 }));
});

/**
 * @openapi
 * '/client/topQuestions':
 *  get:
 *     tags:
 *     - Client
 *     summary: fetch top questions (?type=public or ?type=private)
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
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get("/topQuestions", hasCompletedSignup, async (req, res) => {
	res.json(await topQuestions(req.session.user._id, req.query));
});

/**
 * @openapi
 * '/client/questions/{id}/performance':
 *  get:
 *     tags:
 *     - Client
 *     summary: Question performance in games
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 */
router.get(
	"/questions/:id/performance",
	hasCompletedSignup,
	async (req, res) => {
		res.json(await questionPerformance(req.params.id, req.query));
	}
);

/**
 * @openapi
 * '/client/questionsFromFriendsLatestGames':
 *  get:
 *     tags:
 *     - Client
 *     summary: fetch questions from friends latest games
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get(
	"/questionsFromFriendsLatestGames",
	hasCompletedSignup,
	async (req, res) => {
		res.json(
			await questionsFromFriendsLatestGames(req.session.user._id, req.query)
		);
	}
);

/**
 * @openapi
 * '/client/transactions':
 *  get:
 *     tags:
 *     - Client
 *     summary: fetch user transactions (financial history)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get("/transactions", hasCompletedSignup, async (req, res) => {
	res.json(await getTransactions(req.session.user._id, req.query));
});

/**
 * @openapi
 * '/client/bugReports/add':
 *  post:
 *     tags:
 *     - Client
 *     summary: send a bug report
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - category
 *              - subCategory
 *              - description
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              category:
 *                type: object
 *                default: {id: 1, title: "Gameplay"}
 *              subCategory:
 *                type: object
 *                format: {id: 1, title: "gameplay subcategory 1"}
 *              description:
 *                type: string
 *                format: sample description
 */
router.post("/bugReports/add", sameUser, async (req, res) => {
	res.json(await reportBug(req.session.user, req.body));
});

module.exports = router;
