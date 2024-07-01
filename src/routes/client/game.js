const express = require("express");
const router = express.Router();
const {
	init,
	createGame,
	joinGame,
	searchUsers,
} = require("../../controllers/Client/GameController");
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
router.post("/create", sameUser, async (req, res) => {
	res.json(await createGame(req.session.user, req.body));
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
router.post("join", sameUser, async (req, res) => {
	res.json(await joinGame(req.body));
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
router.get("searchUsers", async (req, res) => {
	res.json(await searchUsers(req.query("search")));
});

module.exports = router;
