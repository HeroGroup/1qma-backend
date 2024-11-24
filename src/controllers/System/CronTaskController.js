const moment = require("moment");
const { handleException, leaveRoom } = require("../../helpers/utils");
const Game = require("../../models/Game");
const Setting = require("../../models/Setting");
const User = require("../../models/User");
const { gameStatuses } = require("../../helpers/constants");
const { refundPlayers } = require("../Client/GameController");
const SurvivalLeague = require("../../models/SurvivalLeague");

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

		let message = "";
		const filteredUsersIds = [];
		for (const user of filteredUsers) {
			filteredUsersIds.push(user._id);
			message += `${user.email} \n`;
		}

		await User.updateMany(
			{ _id: { $in: filteredUsersIds } },
			{ $inc: { "accountType.expireDays": 30 } }
		);

		return success(`${message} accounts updated successfully!`);
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

		const now = moment();
		const abandonedGamesIds = [];
		for (const liveGame of liveGames) {
			if (
				(liveGame.status === gameStatuses.CREATED &&
					now.diff(moment(liveGame.createdAt), "minutes") > 15) ||
				(liveGame.status === gameStatuses.STARTED &&
					now.diff(moment(liveGame.startedAt), "hours") > 1)
			) {
				const liveGameId = liveGame._id.toString();
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

exports.cancelPendingInvitations = async (token) => {
	try {
		if (token !== env.cancelPendingInvitationsToken) {
			return fail("invalid token!");
		}

		const invitationLinkValiditySetting = await Setting.findOne({
			key: "INVITATION_LINK_VALIDITY_DAYS",
		});
		const invitationLinkValidityMiliseconds =
			parseInt(invitationLinkValiditySetting?.value || 2) * 24 * 60 * 60 * 1000;

		const updateResult = await User.updateMany(
			{},
			{
				$pull: {
					invitations: {
						status: "pending",
						createdAt: {
							$gt: new Date(
								Date.now() - invitationLinkValidityMiliseconds
							).toISOString(),
						},
					},
				},
			}
		);

		return success(`${updateResult.modifiedCount} updated successfully!`);
	} catch (e) {
		return handleException(e);
	}
};

exports.endSurvivalLeague = async (token) => {
	try {
		if (token !== env.endSurvivalToken) {
			return fail("invalid token!");
		}

		const survivalLeague = await SurvivalLeague.findOne({ isActive: true });

		if (!survivalLeague) {
			return fail("There are no active survival leagues!");
		}

		const survivalLeagueEndDate = survivalLeague.endDate;
		const survivalLeagueTotalGames = survivalLeague.totalGames;
		const survivalLeagueTotalScore = survivalLeague.totalScore;

		let passed = false;

		if (survivalLeagueEndDate && moment().isAfter(survivalLeague.endDate)) {
			passed = true;
		} else if (survivalLeagueTotalGames > 0) {
			const usersMaxTotalSurvivalGamesPlayed = await User.find()
				.sort({ "games.survivalGamesPlayed": -1 })
				.limit(1);

			const usersMaxTotalSurvivalGamesPlayedValue =
				usersMaxTotalSurvivalGamesPlayed[0]?.games.survivalGamesPlayed || 0;

			if (usersMaxTotalSurvivalGamesPlayedValue > survivalLeagueTotalGames) {
				passed = true;
			}
		} else if (survivalLeagueTotalScore) {
			const usersMaxSurvivalTotalScore = await User.find()
				.sort({ "statistics.survival.totalScore": -1 })
				.limit(1);

			const usersMaxSurvivalTotalScoreValue =
				usersMaxSurvivalTotalScore[0]?.statistics.survival.totalScore || 0;

			if (usersMaxSurvivalTotalScoreValue > survivalLeagueTotalScore) {
				passed = true;
			}
		}

		if (passed) {
			await SurvivalLeague.findByIdAndUpdate(survivalLeague._id, {
				isActive: false,
			});
		}
	} catch (e) {
		return handleException(e);
	}
};
