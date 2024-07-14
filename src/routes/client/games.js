const express = require("express");
const { overview } = require("../../controllers/Client/GamesController");
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

module.exports = router;
