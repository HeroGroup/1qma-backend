const moment = require("moment");
const { handleException } = require("../../helpers/utils");
const User = require("../../models/User");
const Game = require("../../models/Game");
const { gameStatuses } = require("../../helpers/constants");
const { refundPlayers } = require("../Client/GameController");

exports.renewBasicAccounts = async (token) => {
	try {
		if (token !== env.renewAccountsToken) {
			return fail("invalid token!");
		}

		const now = moment(new Date());

		const users = await User.find({
			"accountType.startDate": { $exists: true },
			"accountType.expireDays": { $exists: true },
		});

		const filteredUsers = users.filter(
			(user) =>
				moment(user.accountType.startDate)
					.add(user.accountType.expireDays, "days")
					.diff(now, "days", true) < 1
		);

		const filteredUsersIds = [];
		for (const user of filteredUsers) {
			filteredUsersIds.push(user._id);
		}

		await User.updateMany(
			{ _id: { $in: filteredUsersIds } },
			{ $inc: { "accountType.expireDays": 30 } }
		);

		return success(`${filteredUsers.length} accounts updated successfully!`);
	} catch (e) {
		return handleException(e);
	}
};

exports.cancelAbandonedGames = async (token) => {
	try {
		if (token !== env.cancelAbandonedGamesToken) {
			return fail("invalid token!");
		}

		const liveGames = await Game.find({
			status: { $in: [gameStatuses.CREATED, gameStatuses.STARTED] },
		});

		console.log("liveGames", liveGames.length);

		const now = moment();
		const abandonedGamesIds = [];
		for (const liveGame of liveGames) {
			if (
				(liveGame.status === gameStatuses.CREATED &&
					moment(liveGame.createdAt).diff(now, "minutes") > 15) ||
				(liveGame.status === gameStatuses.STARTED &&
					moment(liveGame.startedAt).diff(now, "hours") > 1)
			) {
				const liveGameId = liveGame._id.toString();
				console.log(liveGameId, liveGame.status);
				abandonedGamesIds.push(liveGame._id);
				io.to(liveGameId).emit("cancel game", {});
				for (const player of liveGame.players) {
					leaveRoom(player.socketId, liveGameId, player.email);
				}
				await refundPlayers(liveGame, liveGame.status);
			}
		}

		await Game.updateMany(
			{ _id: { $in: abandonedGamesIds } },
			{ status: gameStatuses.CANCELED, canceledAt: now }
		);

		return success(`${abandonedGamesIds.length} games updated successfully!`);
	} catch (e) {
		return handleException(e);
	}
};
