const {
	handleException,
	createGameCode,
	joinUserToGameRoom,
	getSocketClient,
	objectId,
	leaveRoom,
	generateQR,
	xpNeededForNextLevel,
} = require("../../helpers/utils");
const { validateEmail } = require("../../helpers/validator");
const { createModes, gameTypes } = require("../../helpers/constants");
const Category = require("../../models/Category");
const Game = require("../../models/Game");
const Setting = require("../../models/Setting");
const User = require("../../models/User");

const gameCustomProjection = async (game) => {
	const gameLink = `${env.frontAppUrl}/game/join?code=${game.code}`;

	return {
		gameId: game._id,
		gameCreator: game.creator,
		gameCode: game.code,
		gameCategory: game.category,
		gameType: game.gameType,
		gameLink,
		gameQRCode: await generateQR(gameLink),
		gamePlayers: game.players.filter((plyr) => plyr.status === "connected"),
	};
};

exports.init = async () => {
	try {
		const numberOfPlayers = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});

		const createGamePrice = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});

		const eachStepDurationSetting = await Setting.findOne({
			key: "GAME_STEP_DURATION_SECONDS",
		});

		const waitingTimeSecondsSetting = await Setting.findOne({
			key: "WAITING_TIME_SECONDS",
		});

		const numberOfRetriesSetting = await Setting.findOne({
			key: "NUMBER_OF_FIND_PLAYERS_RETRIES",
		});

		const categories = await Category.find();

		return success("initialize game parameters", {
			createModes,
			gameTypes,
			numberOfPlayers: numberOfPlayers?.value || 5,
			gamePrice: { coin: "bronze", count: createGamePrice?.value || 2 },
			eachStepDurationSeconds: eachStepDurationSetting?.value || 120,
			waitingTimeSeconds: waitingTimeSecondsSetting?.value || 120,
			numberOfRetries: numberOfRetriesSetting?.value || 2,
			categories,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.createGame = async (params, socketId) => {
	try {
		const { id, gameType, createMode, category, question, answer } = params;

		let { players } = params;

		if (!id) {
			return fail("Invalid creator id!");
		}

		if (!gameType || !gameTypes.find((element) => element.id === gameType)) {
			return fail("Invalid game type!");
		}

		if (
			!createMode ||
			!createModes.find((element) => element.id === createMode)
		) {
			return fail("Invalid create mode!");
		}

		if (!category) {
			return fail("invalid category id!");
		}

		if (!question) {
			return fail("Question is not entered!");
		}

		if (!answer) {
			return fail("Answer is not entered!");
		}

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});
		const playersShouldCount = numberOfPlayersSetting
			? numberOfPlayersSetting.value
			: 5;

		if (createMode === "3" || createMode === "2") {
			if (!players || players.length < playersShouldCount - 1) {
				return fail("not enough players!");
			}
			if (players.length > playersShouldCount - 1) {
				return fail("too much players were selected!");
			}
		}

		const dbCategory = await Category.findById(category);
		if (!dbCategory) {
			return fail("Invalid category!");
		}

		if (players) {
			// send invites to players
		} else {
			// find players who match game criteria and send proper notification
		}

		const creator = await User.findById(id);
		if (!creator) {
			return fail("invalid creator!");
		}

		// check if creator has enough coin
		const createGamePriceSetting = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});
		const creatorBronzeCoins = creator.assets.coins.bronze;
		const createGamePrice = createGamePriceSetting?.value || 2;
		if (parseInt(creatorBronzeCoins) < parseInt(createGamePrice)) {
			return fail(
				"Unfortunately you do not have enough coins for creating a game!",
				{ creatorBronzeCoins, createGamePrice }
			);
		}

		const {
			_id: creator_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = creator;
		const game = new Game({
			code: `G-${createGameCode()}`,
			creator: { _id: creator_id, firstName, lastName, email, profilePicture },
			createMode: createModes.find((element) => element.id === createMode),
			gameType: gameTypes.find((element) => element.id === gameType),
			category: dbCategory,
			players: [
				{
					_id: creator_id,
					firstName,
					lastName,
					email,
					profilePicture,
					socketId,
					status: "connected",
				},
			],
			questions: [
				{
					user_id: creator_id,
					question,
					answers: [
						{
							user_id: creator_id,
							answer,
							rates: [],
						},
					],
					rates: [],
				},
			],
			status: "created", // started, ended
			createdAt: moment(),
		});

		await game.save();

		// decrease creator coins
		const playerUser = await User.findOneAndUpdate(
			{ _id: creator._id },
			{ $inc: { "assets.coins.bronze": -createGamePrice } },
			{ new: true }
		);

		joinUserToGameRoom(socketId, game._id.toString());

		return success("Game was created successfully!", {
			game: await gameCustomProjection(game),
			newBalance: playerUser.assets,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.attemptjoin = async (user, code) => {
	try {
		if (!user) {
			return fail("invalid user!");
		}

		if (!code) {
			return fail("Invalid Game Code!");
		}

		const gameProjection = {
			_id: 1,
			creator: 1,
			category: 1,
			gameType: 1,
			status: 1,
		};
		let game = await Game.findOne({ code }, gameProjection);
		if (!game) {
			game = await Game.findById(code, gameProjection);
			if (!game) {
				return fail("Invalid Game!");
			}
		}

		if (game.status !== "created") {
			return fail("this game is already started!", game.status);
		}

		if (game.creator._id.toString() === user._id) {
			return fail("You are already in this game!");
		}

		const joinGamePriceSetting = await Setting.findOne({
			key: "JOIN_GAME_PRICE_BRONZE",
		});
		const joinGamePrice = joinGamePriceSetting?.value || 2;

		const dbUser = await User.findById(user._id);
		const balance = dbUser?.assets.coins.bronze;

		return success("ok", { game, joinGamePrice, balance });
	} catch (e) {
		return handleException(e);
	}
};

exports.joinGame = async (params, socketId) => {
	try {
		const { id, gameId, question, answer } = params;

		if (!id) {
			return fail("Invalid player id!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player!");
		}

		if (!gameId) {
			return fail("Game id required!");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		// check player is not already in game
		if (
			game.players.find(
				(element) =>
					element._id.toString() === player._id.toString() &&
					element.status !== "left"
			)
		) {
			return fail("You are already in this game!");
		}

		if (!question) {
			return fail("Enter a question!");
		}

		if (!answer) {
			return fail("Enter answer for the question!");
		}

		let gameStatus = game.status;
		if (gameStatus === "started") {
			return fail("Sorry, Game is already started!");
		} else if (gameStatus === "ended") {
			return fail("Sorry, Game has already ended!");
		}

		// check if player has enough coins
		const joinGamePriceSetting = await Setting.findOne({
			key: "JOIN_GAME_PRICE_BRONZE",
		});
		const playerBronzeCoins = player.assets.coins.bronze;
		const joinGamePrice = joinGamePriceSetting?.value || 2;
		if (parseInt(playerBronzeCoins) < parseInt(joinGamePrice)) {
			return fail(
				"Unfortunately you do not have enough coins for joining this game!",
				{ playerBronzeCoins, joinGamePrice }
			);
		}

		const {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = player;

		// update players coins
		const playerUser = await User.findOneAndUpdate(
			{ _id: player_id },
			{ $inc: { "assets.coins.bronze": -joinGamePrice } },
			{ new: true }
		);

		const gameRoom = game._id.toString();
		joinUserToGameRoom(socketId, gameRoom);
		io.to(gameRoom).emit("player added", {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		});

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});
		const currentPlayersCount = game.players.length;
		let isStarted = false;
		if (parseInt(numberOfPlayersSetting.value) === currentPlayersCount + 1) {
			isStarted = true;
		}

		game = await Game.findOneAndUpdate(
			{ _id: game.id },
			{
				$push: {
					players: {
						_id: player_id,
						firstName,
						lastName,
						email,
						profilePicture,
						socketId,
						status: "connected",
					},
					questions: {
						user_id: player_id,
						question,
						answers: [
							{
								user_id: player_id,
								answer,
								rates: [],
							},
						],
						rates: [],
					},
				},
				...(isStarted ? { status: "started", startedAt: moment() } : {}),
			},
			{ new: true }
		);

		if (game.status === "started") {
			// emit game is started
			io.to(gameRoom).emit("start game", {});
		}

		return success("You have successfully joined the game!", {
			game: await gameCustomProjection(game),
			newBalance: playerUser.assets,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.searchUsers = async (text) => {
	try {
		if (!text || text.length < 3) {
			return fail("Enter at least 3 characters");
		}

		const filter = { $regex: text, $options: "i" };

		const users = await User.find(
			{
				$or: [{ firstName: filter }, { lastName: filter }, { email: filter }],
			},
			{ _id: 1, email: 1, firstName: 1, lastName: 1, profilePicture: 1 }
		);

		return success(`${users.length} matches found!`, users);
	} catch (e) {
		return handleException(e);
	}
};

exports.findFriendGames = async (email, page, limit) => {
	try {
		if (!validateEmail(email)) {
			return fail("invalid email address!");
		}

		const friend = await User.findOne(
			{
				email,
				emailVerified: true,
				hasCompletedSignup: true,
			},
			{ _id: 1, firstName: 1, lastName: 1, profilePicture: 1 }
		);

		if (!friend) {
			return fail("No user is associated with this email address!");
		}

		const liveGames = await Game.find(
			{
				"players._id": friend._id,
				status: "created",
				"createMode.id": { $in: ["0", "1"] }, // players are random
			},
			{ _id: 1, code: 1, category: 1, creator: 1, players: 1, gameType: 1 }
		);

		const endedGames = await Game.find({
			"players._id": friend._id,
			status: "ended",
		})
			.skip(((page || 1) - 1) * (limit || 5))
			.limit(limit || 5);

		const endedGamesMapped = endedGames.map((item) => {
			const friendRankIndex = item.result.scoreboard.findIndex((elm) => {
				return elm._id.toString() === friend._id.toString();
			});
			return {
				_id: item._id,
				category: item.category,
				creator: item.item,
				players: item.players,
				gameType: item.gameType,
				endedAt: item.endedAt,
				rank: friendRankIndex + 1,
				score: item.result.scoreboard[friendRankIndex]?.totalScore || 0,
			};
		});

		return success("ok", { friend, liveGames, endedGames: endedGamesMapped });
	} catch (e) {
		return handleException(e);
	}
};

exports.invitePlayer = async (params) => {
	try {
		const { id, gameId, email } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}

		if (!validateEmail(email)) {
			return fail("invalid email address!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.creator._id.toString() !== player._id.toString()) {
			return fail(
				"You are not allowed to invite players to game. Only game creator is permitted to perform this action."
			);
		}

		if (game.status !== "created") {
			return fail("You are not allowed to invite in this step!");
		}

		return success(`Invitation was sent to ${email} successfully!`);
	} catch (e) {
		return handleException(e);
	}
};

exports.submitAnswer = async (params) => {
	try {
		const { id, gameId, questionId, answer } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}

		if (!questionId) {
			return fail("invalid question id!");
		}

		// if (!answer) {
		// 	return fail("invalid answer!");
		// }

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.status !== "started") {
			return fail("game is not started yet!");
		}

		// check if user has already submited their answer, replace the answer
		// otherwise create new answer object
		const questionIndex = game.questions.findIndex((element) => {
			return element.user_id.toString() === questionId;
		});
		const answerIndex = game.questions[questionIndex].answers.findIndex(
			(element) => {
				return element.user_id.toString() === id;
			}
		);

		const findQuery = { _id: objectId(gameId) };
		let updateQuery = {};
		let arrayFilters = [];

		if (answerIndex === -1) {
			// add answer
			updateQuery = {
				$push: {
					"questions.$[i].answers": {
						user_id: player._id,
						answer,
						rates: [],
					},
				},
			};
			arrayFilters = [{ "i.user_id": objectId(questionId) }];
		} else {
			// edit answer
			updateQuery = { $set: { "questions.$[i].answers.$[j].answer": answer } };
			arrayFilters = [
				{ "i.user_id": objectId(questionId) },
				{ "j.user_id": objectId(id) },
			];
		}

		game = await Game.findOneAndUpdate(findQuery, updateQuery, {
			arrayFilters,
			new: true,
		});

		const numberOfSubmitted = game.questions[questionIndex].answers.length;
		const numberOfPlayers = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;

		if (numberOfSubmitted >= numberOfPlayers) {
			// emit next question
			io.to(gameId).emit("next step", {});
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted,
				numberOfPlayers,
			});
		}

		return success("Thank you for the answer.");
	} catch (e) {
		return handleException(e);
	}
};

exports.getQuestion = async (userId, gameId, step) => {
	try {
		if (!userId) {
			return fail("invalid user id!");
		}
		if (!gameId) {
			return fail("invalid game id!");
		}
		if (!step) {
			return fail("invalid step!");
		}

		const player = await User.findById(userId);
		if (!player) {
			return fail("invalid player");
		}

		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.status !== "started") {
			return fail("game is not started yet!");
		}

		if (parseInt(step) > game.players.length) {
			return fail("questions are finished!", {
				step,
				nop: game.players.length,
			});
		}

		const questionObject = game.questions[step - 1];
		const answers = questionObject.answers;

		const myAnswer = answers.find((answerObj) => {
			return answerObj.user_id.toString() === player._id.toString();
		})?.answer;

		return success("ok", {
			step,
			_id: questionObject.user_id,
			question: questionObject.question,
			myAnswer,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.getAnswers = async (gameId, questionId) => {
	try {
		if (!gameId) {
			return fail("invalid game id!");
		}
		if (!questionId) {
			return fail("invalid question id!");
		}

		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		const gameQuestions = game.questions;

		const questionIndex = gameQuestions.findIndex((element) => {
			return element.user_id.toString() === questionId;
		});

		const answers = (gameQuestions[questionIndex]?.answers || []).map(
			(element) => {
				return {
					_id: element.user_id,
					answer: element.answer,
				};
			}
		);

		return success("ok", {
			questionId,
			question: gameQuestions[questionIndex]?.question,
			answers,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.rateAnswers = async (params) => {
	try {
		const { id, gameId, questionId, rates } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		if (!gameId) {
			return fail("invalid game id!");
		}
		if (!questionId) {
			return fail("invalid question id!");
		}
		if (!rates || typeof rates !== "object") {
			return fail("invalid rates!");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}
		if (game.status !== "started") {
			return fail("You are not allowed to rate in this step!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid rater user");
		}

		const questionIndex = game.questions.findIndex((element) => {
			return element.user_id.toString() === questionId;
		});

		let ratesCount = 0;
		for (const element of rates) {
			// check if player has already rated, replace the rate
			const answerIndex = game.questions[questionIndex].answers.findIndex(
				(answr) => {
					return answr.user_id.toString() === element.answer_id;
				}
			);
			const rateIndex = game.questions[questionIndex].answers[
				answerIndex
			].rates.findIndex((rt) => {
				return rt.user_id.toString() === id;
			});
			if (rateIndex === -1) {
				game = await Game.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						$push: {
							"questions.$[i].answers.$[j].rates": {
								user_id: id,
								rate: element.rate,
							},
						},
					},
					{
						arrayFilters: [
							{ "i.user_id": objectId(questionId) },
							{ "j.user_id": objectId(element.answer_id) },
						],
						new: true,
					}
				);

				ratesCount +=
					game.questions[questionIndex].answers[answerIndex].rates.length;
			} else {
				await Game.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						"questions.$[i].answers.$[j].rates.$[k].rate": element.rate,
					},
					{
						arrayFilters: [
							{ "i.user_id": objectId(questionId) },
							{ "j.user_id": objectId(element.answer_id) },
							{ "k.user_id": objectId(id) },
						],
						new: true,
					}
				);

				ratesCount +=
					game.questions[questionIndex].answers[answerIndex].rates.length;
			}
		}

		// check if all users has rated, go to the next step
		const playersCount = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;
		if (ratesCount >= playersCount * playersCount) {
			// everyone has answered, emit next question
			io.to(gameId).emit("next step", {});
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted: ratesCount / playersCount,
				numberOfPlayers: playersCount,
			});
		}

		return success("Thank you for the rates", ratesCount);
	} catch (e) {
		return handleException(e);
	}
};

exports.getAllQuestions = async (gameId) => {
	try {
		if (!gameId) {
			return fail("invalid game id!");
		}
		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		const questions = game.questions.map((element) => {
			return {
				_id: element.user_id,
				question: element.question,
			};
		});

		return success("ok", questions);
	} catch (e) {
		return handleException(e);
	}
};

exports.rateQuestions = async (params) => {
	try {
		const { id, gameId, rates } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		if (!gameId) {
			return fail("invalid game id!");
		}
		if (!rates || typeof rates !== "object") {
			return fail("invalid rates!");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}
		if (game.status !== "started") {
			return fail("You are not allowed to rate in this step!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid rater user");
		}

		let ratesCount = 0;
		for (const element of rates) {
			// check if player has already rated, replace the rate
			const questionIndex = game.questions.findIndex((qstn) => {
				return qstn.user_id.toString() === element.question_id;
			});
			const rateIndex = game.questions[questionIndex].rates.findIndex((rt) => {
				return rt.user_id.toString() === id;
			});
			if (rateIndex === -1) {
				game = await Game.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						$push: {
							"questions.$[i].rates": {
								user_id: id,
								rate: element.rate,
							},
						},
					},
					{
						arrayFilters: [{ "i.user_id": objectId(element.question_id) }],
						new: true,
					}
				);

				ratesCount += game.questions[questionIndex].rates.length;
			} else {
				game = await Game.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						"questions.$[i].rates.$[j].rate": element.rate,
					},
					{
						arrayFilters: [
							{ "i.user_id": objectId(element.question_id) },
							{ "j.user_id": objectId(id) },
						],
						new: true,
					}
				);

				ratesCount += game.questions[questionIndex].rates.length;
			}
		}

		// check if all users has rated, end the game
		const playersCount = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;
		if (ratesCount === playersCount * playersCount) {
			// everyone has answered, calculate and emit result!
			calculateResult(gameId);
			io.to(gameId).emit("end game", {});
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted: ratesCount / playersCount,
				numberOfPlayers: playersCount,
			});
		}

		return success("Thank you for the rates", ratesCount);
	} catch (e) {
		return handleException(e);
	}
};

exports.showResult = async (gameId, userId) => {
	try {
		if (!gameId) {
			return fail("invalid game id!");
		}
		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}
		if (game.status !== "ended") {
			return success("game is not ended yet!", gameProjection(game));
		}

		if (game.result) {
			const { creator, category, gameType, startedAt, endedAt, result } = game;

			let statistics = {};
			if (userId) {
				// check if user is in game
				const playerIndex = game.players.findIndex((element) => {
					return element._id.toString() === userId.toString();
				});
				if (playerIndex > -1) {
					// send latest user statistics as well
					const user = await User.findById(userId);
					const gameScoreboard = game.result.scoreboard;

					const playerIndexInScoreboard = gameScoreboard.findIndex((elm) => {
						return elm._id.toString() === userId.toString();
					});
					const playerScoreboard = gameScoreboard[playerIndexInScoreboard];

					statistics = {
						...user.statistics,
						score: playerScoreboard?.totalScore,
						xp: playerScoreboard?.totalXp,
						reward: playerScoreboard?.reward,
					};
				}
			}

			return success("ok", {
				creator,
				category,
				gameType,
				startedAt,
				endedAt,
				result,
				statistics,
			});
		} else {
			return fail("Result is not ready yet!");
		}
	} catch (e) {
		return handleException(e);
	}
};

exports.exitGame = async (params, socketId) => {
	try {
		const { id, gameId } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}
		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player!");
		}

		const {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = player;

		// check if more than 30% of players have left, end (cancel) the game
		const totalPlayers = game.players.length;
		const leftPlayers = game.players.filter((plyr) => plyr.status === "left"); // plus this user who is leaving

		let canceled = false;
		if ((leftPlayers?.length || 0) + 1 / totalPlayers > 0.3) {
			// cancel game
			canceled = true;
			io.to(gameId).emit("cancel game", {});
		} else {
			// remove player from game
			leaveRoom(socketId, gameId);
			io.to(gameId).emit("player left", {
				_id: player_id,
				firstName,
				lastName,
				email,
				profilePicture,
			});
		}

		// TODO: shift rates properly

		game = await Game.findOneAndUpdate(
			{ _id: objectId(gameId) },
			{
				"players.$[player].status": "left",
				...(canceled ? { status: "canceled", canceledAt: moment() } : {}),
				$pull: {
					questions: { user_id: player_id },
					"questions.$[].rates": { user_id: player_id },
					"questions.$[].answers": { user_id: player_id },
					"questions.$[].answers.$[].rates": { user_id: player_id },
				},
			},
			{ arrayFilters: [{ "player._id": player_id }], new: true }
		);

		return success("ok");
	} catch (e) {
		return handleException(e);
	}
};

exports.playerDisconnected = async (params) => {
	try {
		const { id, gameId } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}
		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player!");
		}

		const {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = player;

		// emit player disconnected
		io.to(gameId).emit("player disconnected", {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		});

		game = await Game.findOneAndUpdate(
			{ _id: objectId(gameId) },
			{
				"players.$[player].status": "disconnected",
			},
			{ arrayFilters: [{ "player._id": player_id }], new: true }
		);
	} catch (e) {
		return handleException(e);
	}
};

exports.reconnectPlayer = async (userId, socketId) => {
	try {
		const userGamesFilter = {
			"players._id": objectId(userId),
			status: { $in: ["created", "started"] },
		};

		const games = await Game.find(userGamesFilter);
		if (games.length > 0) {
			// update user status in games
			await Game.updateMany(
				userGamesFilter,
				{
					"players.$[player].status": "connected",
					"players.$[player].socketId": socketId,
				},
				{ arrayFilters: [{ "player._id": objectId(userId) }] }
			);

			// join user to still existing game rooms
			for (const game of games) {
				joinUserToGameRoom(socketId, game._id.toString());
			}
		}

		return success("ok");
	} catch (e) {
		return handleException(e);
	}
};

const calculateResult = async (gameId) => {
	console.time("calculate-game-result");
	if (!gameId) {
		return fail("invalid game id!");
	}
	const game = await Game.findById(gameId);
	if (!game) {
		return fail("invalid game!");
	}

	if (game.result) {
		return success("ok", game.result);
	}

	const numberOfPlayers = game.players.filter(
		(p) => p.status !== "left"
	).length;

	const scoreboard = game.players
		.filter((plyr) => plyr.status !== "left")
		.map((player) => {
			const questions = game.questions;
			// const ownQuestionIndex = questions.findIndex((element) => {
			// 	return element.user_id.toString() === player._id.toString();
			// });

			const answersRates = [];
			const answersRatesRaw = [];
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				const _questionRate =
					question.rates.find(
						(r) => user_id.toString() === player._id.toString()
					)?.rate || 1 / 100 + 1; // 1 => 1.01, 5 => 1.05

				const answer = question.answers.find(
					(elm) => elm.user_id.toString() === player._id.toString()
				);
				const sumRates =
					answer?.rates.reduce((n, { rate }) => n + rate, 0) || numberOfPlayers;
				answersRatesRaw.push(sumRates);
				answersRates.push(sumRates * _questionRate);
			}

			// const questionRate = questions[ownQuestionIndex].rates.reduce(
			// 	(n, { rate }) => n + rate,
			// 	0
			// );

			const totalScore = answersRates.reduce((acc, cur) => acc + cur); // + questionRate;

			return {
				_id: player._id,
				firstName: player.firstName,
				lastName: player.lastName,
				profilePicture: player.profilePicture,
				answersRates: answersRatesRaw,
				questionRate,
				totalScore,
				totalXp: totalScore * 15,
				reward: { bronze: 0 },
			};
		})
		.sort((a, b) => a.totalScore - b.totalScore)
		.reverse();

	const players = game.players;
	const details = game.questions.map((questionObj) => {
		const questioner = players.find(
			(elm) => elm._id.toString() === questionObj.user_id.toString()
		);

		const answers = questionObj.answers.map((answerObj) => {
			const answerer = players.find(
				(elm) => elm._id.toString() === answerObj.user_id.toString()
			);
			return {
				answerer,
				answer: answerObj.answer,
				rate: answerObj.rates.reduce((n, { rate }) => n + rate, 0),
			};
		});

		return {
			questioner,
			question: questionObj.question,
			rate: questionObj.rates.reduce((n, { rate }) => n + rate, 0),
			answers,
		};
	});

	// update statistics
	for (const item of scoreboard) {
		const plyr = User.findById(item._id);
		const playerHighScore = plyr.games?.highScore || 0;
		const currentXp = plyr.statistics.totalXP + item.totalXp; // 450 + 150 = 600
		let level = plyr.statistics.level; // 0
		let xpNeededForNextLevel = xpNeededForNextLevel(level); // 500
		if (currentXp >= xpNeededForNextLevel) {
			// update level and xpNeededForNextLevel
			level++; // 1
			xpNeededForNextLevel = xpNeededForNextLevel(level); // 1000

			// TODO: send notification for updated level
		}

		await User.findOneAndUpdate(
			{ _id: item._id },
			{
				$inc: {
					"statistics.totalScore": item.totalScore,
					"statistics.totalXp": item.totalXp,
					"games.played": 1,
				},
				"statistics.level": level,
				"statistics.xpNeededForNextLevel": xpNeededForNextLevel,
				"games.highScore":
					item.totalScore > playerHighScore ? item.totalScore : playerHighScore,
			}
		);
	}

	// update winner statistics
	await User.findOneAndUpdate(
		{ _id: scoreboard[0]._id },
		{ $inc: { "games.won": 1 } }
	);

	// update creator statistics
	await User.findOneAndUpdate(
		{ _id: game.creator._id },
		{ $inc: { "games.created": 1 } }
	);

	const result = { scoreboard, details };
	await Game.findOneAndUpdate(
		{ _id: objectId(gameId) },
		{ status: "ended", endedAt: moment(), result }
	);

	console.timeEnd("calculate-game-result");
	return success("ok", result);
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
