const { handleException, objectId } = require("../../helpers/utils");
const Game = require("../../models/Game");

exports.overview = async (userId) => {
	try {
		// my scoreboard
		const myGames = await Game.find({
			"result.scoreboard._id": objectId(userId),
			result: { $exists: true },
		}).sort({ endedAt: -1 });

		const scoreboard = myGames.map((myGame) => {
			const myRank = myGame.result.scoreboard.findIndex(
				(elm) => elm._id === userId
			);
			return {
				endedAt: myGame.endedAt,
				gameType: myGame.gameType,
				category: myGame.category,
				rank: myRank + 1,
				result: myGame.result.scoreboard[myRank],
			};
		});

		return success("ok", scoreboard);
	} catch (e) {
		return handleException(e);
	}
};
