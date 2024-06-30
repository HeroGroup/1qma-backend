const express = require("express");
const router = express.Router();
const {
	init,
	createGame,
	joinGame,
} = require("../../controllers/Client/GameController");

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

router.post("/create", sameUSer, async (req, res) => {
	res.json(await createGame(req.body));
});

router.post("join", sameUser, async (req, res) => {
	res.json(await joinGame(req.body));
});

module.exports = router;
