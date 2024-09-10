const { gameStatuses } = require("../../helpers/constants");
const { findMyFriends } = require("../../helpers/findMyFriends");
const { handleException, objectId } = require("../../helpers/utils");
const Game = require("../../models/Game");
const User = require("../../models/User");

exports.games = async (userId, type, category, page = 1, limit = 5) => {
	try {
		if (!["", "private"].includes(type)) {
			// empty means public
			return fail("invalid type!");
		}
		const games = await Game.find(
			{
				status: gameStatuses.ENDED,
				...(type === "private"
					? { "result.scoreboard._id": objectId(userId) }
					: {}),
				...(category ? { "category._id": objectId(category) } : {}),
			},
			{
				_id: 1,
				code: 1,
				creator: 1,
				category: 1,
				players: 1,
				gameType: 1,
				endedAt: 1,
				result: 1,
			}
		)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

exports.scoreboard = async (userId, page = 1, limit = 5) => {
	try {
		// my scoreboard
		const myGames = await Game.find({
			"result.scoreboard._id": objectId(userId),
		})
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ endedAt: -1 });

		const scoreboard = myGames.map((myGame) => {
			const myRankIndex = myGame.result.scoreboard.findIndex((elm) => {
				return elm._id.toString() === userId.toString();
			});

			return {
				gameId: myGame._id,
				endedAt: myGame.endedAt,
				gameType: myGame.gameType,
				category: myGame.category,
				rank: myRankIndex + 1,
				result: myGame.result.scoreboard[myRankIndex],
			};
		});

		return success("ok", scoreboard);
	} catch (e) {
		return handleException(e);
	}
};

exports.liveGames = async (type, category, page = 1, limit = 5) => {
	try {
		// find games that players are going to be random
		const games = await Game.find(
			{
				status: gameStatuses.CREATED,
				...(type ? { "gameType.id": type } : {}),
				"createMode.id": { $in: ["0", "1"] },
				...(category ? { "category._id": objectId(category) } : {}),
			},
			{
				_id: 1,
				code: 1,
				creator: 1,
				category: 1,
				players: 1,
				gameType: 1,
				createdAt: 1,
			}
		)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

exports.friendsRecentGames = async (userId) => {
	try {
		const { friendsIds } = await findMyFriends(userId);

		const games = await Game.find(
			{
				status: gameStatuses.ENDED,
				"result.scoreboard._id": { $in: friendsIds },
			},
			{
				_id: 1,
				code: 1,
				creator: 1,
				category: 1,
				players: 1,
				gameType: 1,
				endedAt: 1,
				result: 1,
			}
		)
			.sort({ endedAt: -1 })
			.limit(5);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

exports.survivalScoreboard = async () => {
	try {
		const users = await User.find(
			{
				"statistics.survival.adjustedScore": { $gt: 0 },
			},
			{ firstName: 1, lastName: 1, profilePicture: 1, statistics: 1 }
		)
			.sort({ "statistics.survival.adjustedScore": -1 })
			.limit(100);

		return success("ok", users);
	} catch (e) {
		return handleException(e);
	}
};

exports.friendsRecentSurvivalGames = async (userId) => {
	try {
		const { friendsIds } = await findMyFriends(userId);

		const games = await Game.find(
			{
				"gameType.id": "survival",
				status: gameStatuses.ENDED,
				"creator._id": { $in: friendsIds },
				"result.scoreboard._id": objectId(userId),
			},
			{
				_id: 1,
				code: 1,
				creator: 1,
				category: 1,
				players: 1,
				gameType: 1,
				endedAt: 1,
			}
		)
			.sort({ endedAt: -1 })
			.limit(5);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
