const express = require("express");
const router = express.Router();
const {
	init,
	createGame,
	joinGame,
	searchUsers,
	findFriendGames,
	attemptjoin,
	getQuestion,
	submitAnswer,
	editAnswer,
	rateAnswers,
	getAllQuestions,
	rateQuestions,
	getAnswers,
	showResult,
	exitGame,
	invitePlayer,
	keepMyScore,
	backToCheckpoint,
	forceCalculateResult,
} = require("../../controllers/Client/GameController");
const { hasSeenAllIntros } = require("../../middlewares/hasSeenAllIntros");
const { isAdmin } = require("../../middlewares/isAdmin");
const { isPlayerInGame } = require("../../middlewares/isPlayerInGame");
const { sameUser } = require("../../middlewares/sameUser");

/**
 * @openapi
 * '/game/init':
 *  get:
 *     tags:
 *     - Game
 *     summary: initialize game parameters
 */
router.get("/init", async (req, res) => {
	res.json(await init());
});

/**
 * @openapi
 * '/game/create':
 *  post:
 *     tags:
 *     - Game
 *     summary: create game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameType
 *              - createMode
 *              - category
 *              - question
 *              - answer
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameType:
 *                type: string
 *                default: normal
 *              createMode:
 *                type: string
 *                default: 0
 *              category:
 *                type: string
 *                default: 65445678098765456
 *              players:
 *                type: array
 *                default: ["email1@gmail.com", "email2@gmail.com"]
 *              question:
 *                type: string
 *                default: any question
 *              answer:
 *                type: string
 *                default: any answer
 */
router.post("/create", sameUser, hasSeenAllIntros, async (req, res) => {
	const createGameResult = await createGame(req.body, req.session.socketId);

	if (createGameResult.status === 1) {
		req.session.user.assets = createGameResult.newBalance;
	}

	res.json(createGameResult);
});

/**
 * @openapi
 * '/game/{idOrCode}/join':
 *  get:
 *     tags:
 *     - Game
 *     summary: attempt to join a game
 *     parameters:
 *       - in: path
 *         name: idOrCode
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:idOrCode/join", hasSeenAllIntros, async (req, res) => {
	res.json(await attemptjoin(req.session.user, req.params.idOrCode));
});

/**
 * @openapi
 * '/game/join':
 *  post:
 *     tags:
 *     - Game
 *     summary: join game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - question
 *              - answer
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              question:
 *                type: string
 *                default: any question
 *              answer:
 *                type: string
 *                default: any answer
 */
router.post("/join", sameUser, hasSeenAllIntros, async (req, res) => {
	const joinResult = await joinGame(req.body, req.session.socketId);

	if (joinResult.status === 1) {
		req.session.user.assets = joinResult.newBalance;
	}

	res.json(joinResult);
});

/**
 * @openapi
 * '/game/searchUsers':
 *  get:
 *     tags:
 *     - Game
 *     summary: search for users to invite
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 */
router.get("/searchUsers", async (req, res) => {
	res.json(await searchUsers(req.query.search, req.session.user?._id));
});

/**
 * @openapi
 * '/game/find/{email}/games':
 *  get:
 *     tags:
 *     - Game
 *     summary: see friend games
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/find/:email/games", async (req, res) => {
	const { page, limit } = req.query;
	res.json(await findFriendGames(req.params.email, page, limit));
});

/**
 * @openapi
 * '/game/invitePlayer':
 *  post:
 *     tags:
 *     - Game
 *     summary: invite players to game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - email
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              email:
 *                type: string
 *                default: email@server.com
 */
router.post("/invitePlayer", async (req, res) => {
	res.json(await invitePlayer(req.body));
});

/**
 * @openapi
 * '/game/{gameId}/question/{step}':
 *  get:
 *     tags:
 *     - Game
 *     summary: get question in each step
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: step
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/question/:step", isPlayerInGame, async (req, res) => {
	const { gameId, step } = req.params;
	res.json(await getQuestion(req.session.user?._id, gameId, step));
});

/**
 * @openapi
 * '/game/submitAnswer':
 *  post:
 *     tags:
 *     - Game
 *     summary: submit answer to a question
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - questionId
 *              - answer
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              questionId:
 *                type: string
 *                default: 65445678098765456
 *              answer:
 *                type: string
 *                default: any answer
 */
router.post("/submitAnswer", sameUser, isPlayerInGame, async (req, res) => {
	res.json(
		await submitAnswer(
			req.body,
			req.session.user?.preferedLanguage.code || env.defaultLanguage
		)
	);
});

/**
 * @openapi
 * '/game/editAnswer':
 *  post:
 *     tags:
 *     - Game
 *     summary: attempt to edit an answer
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - questionId
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              questionId:
 *                type: string
 *                default: 65445678098765456
 */
router.post("/editAnswer", sameUser, isPlayerInGame, async (req, res) => {
	res.json(await editAnswer(req.body));
});

/**
 * @openapi
 * '/game/{gameId}/{questionId}/answers':
 *  get:
 *     tags:
 *     - Game
 *     summary: get answers of one specific question
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/:questionId/answers", isPlayerInGame, async (req, res) => {
	const { gameId, questionId } = req.params;
	res.send(await getAnswers(gameId, questionId));
});

/**
 * @openapi
 * '/game/rateAnswers':
 *  post:
 *     tags:
 *     - Game
 *     summary: rate all answers of a question
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - questionId
 *              - rates
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              questionId:
 *                type: string
 *                default: 65445678098765456
 *              rates:
 *                type: Array
 *                default: [{"answer_id": "65445678098765456", "rate": "3"}]
 */
router.post("/rateAnswers", sameUser, isPlayerInGame, async (req, res) => {
	res.json(await rateAnswers(req.body));
});

/**
 * @openapi
 * '/game/{gameId}/questions':
 *  get:
 *     tags:
 *     - Game
 *     summary: get all question of the game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/questions", isPlayerInGame, async (req, res) => {
	res.json(await getAllQuestions(req.params.gameId));
});

/**
 * @openapi
 * '/game/rateQuestions':
 *  post:
 *     tags:
 *     - Game
 *     summary: rate all questions of the game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *              - rates
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 *              rates:
 *                type: Array
 *                default: [{"question_id": "65445678098765456", "rate": "3"}]
 */
router.post("/rateQuestions", sameUser, isPlayerInGame, async (req, res) => {
	res.json(await rateQuestions(req.body));
});

/**
 * @openapi
 * '/game/{gameId}/result':
 *  get:
 *     tags:
 *     - Game
 *     summary: show result of the game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/result", async (req, res) => {
	res.json(await showResult(req.params.gameId, req.session.user._id));
});

router.post("/forceCalcResult", isAdmin, async (req, res) => {
	res.json(await forceCalculateResult(req.body.gameId));
});

/**
 * @openapi
 * '/game/leave':
 *  post:
 *     tags:
 *     - Game
 *     summary: leave the game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 */
router.post("/leave", isPlayerInGame, async (req, res) => {
	res.json(await exitGame(req.body, req.session.socketId));
});

/**
 * @openapi
 * '/game/keepMyScore':
 *  post:
 *     tags:
 *     - Game
 *     summary: keep the score of lost player
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 */
router.post("/keepMyScore", isPlayerInGame, async (req, res) => {
	const keepMyScoreResult = await keepMyScore(req.body);

	if (keepMyScoreResult.status === 1) {
		req.session.user.assets = keepMyScoreResult.newBalance;
	}

	res.json(keepMyScoreResult);
});

/**
 * @openapi
 * '/game/backToCheckpoint':
 *  post:
 *     tags:
 *     - Game
 *     summary: Lost player decides to go back to previous checkpoint
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - gameId
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              gameId:
 *                type: string
 *                default: 65445678098765456
 */
router.post("/backToCheckpoint", isPlayerInGame, async (req, res) => {
	res.json(await backToCheckpoint());
});

module.exports = router;
