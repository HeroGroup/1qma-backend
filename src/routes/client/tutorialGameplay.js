const express = require("express");
const router = express.Router();

const { sameUser } = require("../../middlewares/sameUser");
const {
	isPlayerInTutorialGame,
} = require("../../middlewares/isPlayerInTutorialGame");
const { hasCompletedSignup } = require("../../middlewares/hasCompletedSignup");

const {
	init,
	createGame,
	startGame,
	getQuestion,
	submitAnswer,
	getAnswers,
	rateAnswers,
	getAllQuestions,
	rateQuestions,
	showResult,
	exitGame,
} = require("../../controllers/Client/TutorialGameplayController");

/**
 * @openapi
 * '/tutorials/gameplay/init':
 *  get:
 *     tags:
 *     - Tutorial Gameplay
 *     summary: initialize tutorial game parameters
 */
router.get("/init", async (req, res) => {
	res.json(await init());
});

/**
 * @openapi
 * '/tutorials/gameplay/create':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
 *     summary: create tutorial game
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
 *              - answer
 *            properties:
 *              id:
 *                type: string
 *                default: 65445678098765456
 *              category:
 *                type: string
 *                default: 65445678098765456
 *              question:
 *                type: string
 *                default: any question
 *              answer:
 *                type: string
 *                default: any answer
 */
router.post("/create", sameUser, async (req, res) => {
	res.json(await createGame(req.body));
});

/**
 * @openapi
 * '/tutorials/gameplay/start':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
 *     summary: create tutorial game
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
router.post("/start", sameUser, async (req, res) => {
	res.json(await startGame(req.body));
});

/**
 * @openapi
 * '/tutorials/gameplay/{gameId}/question/{step}':
 *  get:
 *     tags:
 *     - Tutorial Gameplay
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
router.get(
	"/:gameId/question/:step",
	isPlayerInTutorialGame,
	async (req, res) => {
		const { gameId, step } = req.params;
		res.json(await getQuestion(req.session.user?._id, gameId, step));
	}
);

/**
 * @openapi
 * '/tutorials/gameplay/submitAnswer':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
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
router.post(
	"/submitAnswer",
	sameUser,
	isPlayerInTutorialGame,
	async (req, res) => {
		res.json(
			await submitAnswer(
				req.body,
				req.session.user?.preferedLanguage.code || env.defaultLanguage
			)
		);
	}
);

/**
 * @openapi
 * '/tutorials/gameplay/{gameId}/{questionId}/answers':
 *  get:
 *     tags:
 *     - Tutorial Gameplay
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
router.get(
	"/:gameId/:questionId/answers",
	isPlayerInTutorialGame,
	async (req, res) => {
		const { gameId, questionId } = req.params;
		res.send(await getAnswers(gameId, questionId));
	}
);

/**
 * @openapi
 * '/tutorials/gameplay/rateAnswers':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
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
router.post(
	"/rateAnswers",
	sameUser,
	isPlayerInTutorialGame,
	async (req, res) => {
		res.json(await rateAnswers(req.body));
	}
);

/**
 * @openapi
 * '/tutorials/gameplay/{gameId}/questions':
 *  get:
 *     tags:
 *     - Tutorial Gameplay
 *     summary: get all question of the game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/questions", isPlayerInTutorialGame, async (req, res) => {
	res.json(await getAllQuestions(req.params.gameId));
});

/**
 * @openapi
 * '/tutorials/gameplay/rateQuestions':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
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
router.post(
	"/rateQuestions",
	sameUser,
	isPlayerInTutorialGame,
	async (req, res) => {
		res.json(await rateQuestions(req.body));
	}
);

/**
 * @openapi
 * '/tutorials/gameplay/{gameId}/result':
 *  get:
 *     tags:
 *     - Tutorial Gameplay
 *     summary: show result of the game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 */
router.get("/:gameId/result", hasCompletedSignup, async (req, res) => {
	res.json(await showResult(req.params.gameId));
});

/**
 * @openapi
 * '/tutorials/gameplay/leave':
 *  post:
 *     tags:
 *     - Tutorial Gameplay
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
router.post("/leave", isPlayerInTutorialGame, async (req, res) => {
	res.json(await exitGame(req.body));
});

module.exports = router;
