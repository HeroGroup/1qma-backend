const { handleException, objectId } = require("../../helpers/utils");
const Game = require("../../models/Game");
const User = require("../../models/User");

exports.games = async (userId, type, category, page = 1, limit = 5) => {
	try {
		// type: all, my
		const games = await Game.find(
			{
				status: "ended",
				...(type === "all"
					? {}
					: { players: { _id: userId, status: "connected" } }),
				...(category ? { "category.name": category } : {}),
			},
			{ _id: 1, code: 1, creator: 1, category: 1, players: 1, gameType: 1 }
		)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

exports.scoreboard = async (userId) => {
	try {
		// my scoreboard
		const myGames = await Game.find({
			"result.scoreboard._id": userId,
			result: { $exists: true },
		});

		const scoreboard = myGames.map((myGame) => {
			const myRankIndex = myGame.result.scoreboard.findIndex((elm) => {
				return elm._id.toString() === userId.toString();
			});
			return {
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
				status: "created",
				"gameType.id": type,
				$or: [{ createMode: "0" }, { createMode: "1" }],
				...(category ? { "category.name": category } : {}),
			},
			{ _id: 1, code: 1, creator: 1, category: 1, players: 1, gameType: 1 }
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
		const friends = await User.find(
			{
				"referer._id": userId,
				hasCompletedSignup: true,
			},
			{ _id: 1 }
		);

		const friendsIds = [];
		for (const friend of friends) {
			friendsIds.push(friend._id);
		}

		const games = await Game.find(
			{
				status: "ended",
				"players._id": { $in: friendsIds },
			},
			{ _id: 1, code: 1, creator: 1, category: 1, players: 1, gameType: 1 }
		)
			.sort({ createdAt: -1 })
			.limit(5);

		return success("ok", games);
	} catch (e) {
		return handleException(e);
	}
};

exports.survivalScoreboard = async () => {};

exports.liveSurvivalGames = async (category) => {};

exports.friendsRecentSurvivalGames = async () => {};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
