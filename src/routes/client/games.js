const express = require("express");
const {
	overview,
	liveGames,
	friendsRecentGames,
} = require("../../controllers/Client/GamesController");
const router = express.Router();

/**
 * @openapi
 * '/games':
 *  get:
 *     tags:
 *     - Games
 *     summary: Games overview
 */
router.get("/", async (req, res) => {
	res.json(await overview(req.session.user._id));
});

/**
 * @openapi
 * '/games/live':
 *  get:
 *     tags:
 *     - Games
 *     summary: Live (ongoing) games
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 */
router.get("/live", async (req, res) => {
	const { type, category } = req.query;
	res.json(await liveGames(type, category));
});

/**
 * @openapi
 * '/games/friendsRecent':
 *  get:
 *     tags:
 *     - Games
 *     summary: Friends Recent Games
 */
router.get("/friendsRecent", async (req, res) => {
	res.json(friendsRecentGames(req.session.user._id));
});

module.exports = router;
