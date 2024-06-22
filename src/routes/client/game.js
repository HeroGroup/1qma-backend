const express = require("express");
const router = express.Router();
const { init } = require("../../controllers/Client/GameController");

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

module.exports = router;
