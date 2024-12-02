const express = require("express");
const {
	scoreboard,
	liveGames,
	friendsRecentGames,
	survivalScoreboard,
	friendsRecentSurvivalGames,
	games,
} = require("../../controllers/Client/GamesController");
const router = express.Router();

/**
 * @openapi
 * '/games':
 *  get:
 *     tags:
 *     - Games
 *     summary: All Games, My Games
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
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
router.get("/", async (req, res) => {
	const { type, category, sort, page, limit } = req.query;
	res.json(
		await games(req.session.user._id, type, category, sort, page, limit)
	);
});

/**
 * @openapi
 * '/games/scoreboard':
 *  get:
 *     tags:
 *     - Games
 *     summary: My scoreboard
 */
router.get("/scoreboard", async (req, res) => {
	res.json(
		await scoreboard(req.session.user._id, req.query.page, req.query.limit)
	);
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get("/live", async (req, res) => {
	const { type, category, page, limit } = req.query;
	res.json(await liveGames(type, category, page, limit));
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
	res.json(await friendsRecentGames(req.session.user._id));
});

/**
 * @openapi
 * '/games/scoreboard/survival':
 *  get:
 *     tags:
 *     - Games
 *     summary: Survival games global scoreboard
 */
router.get("/scoreboard/survival", async (req, res) => {
	res.json(await survivalScoreboard(req.session.user?.preferedLanguage));
});

/**
 * @openapi
 * '/games/live/survival':
 *  get:
 *     tags:
 *     - Games
 *     summary: Live Survival games
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 */
router.get("/live/:type", async (req, res) => {
	const { type } = req.params;
	const { category, page, limit } = req.query;
	res.json(await liveGames(type, category, page, limit));
});

/**
 * @openapi
 * '/games/friendsRecent/survival':
 *  get:
 *     tags:
 *     - Games
 *     summary: Friends Recent Survival Games
 */
router.get("/friendsRecent/survival", async (req, res) => {
	res.json(await friendsRecentSurvivalGames(req.session.user._id));
});

module.exports = router;
