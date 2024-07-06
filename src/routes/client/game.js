const express = require("express");
const router = express.Router();
const {
	init,
	createGame,
	joinGame,
	searchUsers,
	findFriendGames,
	prejoin,
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
router.post("/create", sameUser, async (req, res) => {
	res.json(await createGame(req.body, req.session.socketId));
});

/**
 * @openapi
 * '/game/{code}/join':
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
router.get("/:idOrCode/join", async (req, res) => {
	res.json(await prejoin(req.session.user, req.params.idOrCode));
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
router.post("/join", sameUser, async (req, res) => {
	res.json(await joinGame(req.body, req.session.socketId));
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
	res.json(await searchUsers(req.query.search));
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
	res.json(await findFriendGames(req.params.email));
});

module.exports = router;
