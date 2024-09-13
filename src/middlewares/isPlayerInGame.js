const Game = require("../models/Game");

exports.isPlayerInGame = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else {
		const gameId = req.body.gameId || req.params.gameId;
		if (!gameId || gameId === undefined) {
			return res.sendStatus(400);
		}
		const userId = req.session.user?._id?.toString() || null;
		if (!userId) {
			return res.sendStatus(400);
		}
		const game = await Game.findById(gameId);
		if (!game) {
			return res.sendStatus(404);
		}

		// check if player is in game
		const playerIndex = game.players.findIndex((element) => {
			return element._id.toString() === userId;
		});
		if (playerIndex === -1) {
			return res.sendStatus(400);
		} else {
			next();
		}
	}
};
