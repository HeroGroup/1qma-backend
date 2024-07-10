const {
	handleException,
	createGameCode,
	joinUserToGameRoom,
	getSocketClient,
	objectId,
} = require("../../helpers/utils");
const { validateEmail } = require("../../helpers/validator");
const Category = require("../../models/Category");
const Game = require("../../models/Game");
const Setting = require("../../models/Setting");
const User = require("../../models/User");

const createModes = [
	{ id: "0", text: "I'm ready" },
	{ id: "1", text: "Topic by me" },
	{ id: "2", text: "Players by me" },
	{ id: "3", text: "I'm in Full Control" },
];

const gameTypes = [
	{ id: "normal", text: "Normal" },
	{ id: "survival", text: "Survival" },
];

exports.init = async () => {
	try {
		const numberOfPlayers = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});

		const createGamePrice = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});

		const categories = await Category.find();

		return success("initialize game parameters", {
			createModes,
			gameTypes,
			numberOfPlayers: numberOfPlayers?.value || 5,
			gamePrice: { coin: "bronze", count: createGamePrice?.value || 2 },
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

		const socket = getSocketClient(socketId);
		const rooms = socket.rooms || {};

		return success("Game was created successfully!", {
			game: gameCustomProjection(game),
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
				(element) => element._id.toString() === player._id.toString()
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
		if (parseInt(numberOfPlayersSetting.value) === currentPlayersCount + 1) {
			gameStatus = "started";
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
				status: gameStatus,
			},
			{ new: true }
		);

		if (game.status === "started") {
			// emit game is started
			io.to(gameRoom).emit("start game", {});
		}

		return success("You have successfully joined the game!", {
			game: gameCustomProjection(game),
			newBalance: playerUser.assets,
		});
	} catch (e) {
		return handleException(e);
	}
};

const gameCustomProjection = (game) => {
	return {
		gameId: game._id,
		gameCreator: game.creator,
		gameCode: game.code,
		gameCategory: game.category,
		gameType: game.gameType,
		gameLink: `https://staging.1qma.games/game/join?code=${game.code}`,
	};
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

exports.findFriendGames = async (email) => {
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
				"creator._id": friend._id,
				status: "created",
			},
			{ _id: 1, code: 1, category: 1, creator: 1, players: 1, gameType: 1 }
		);
		const endedGames = await Game.find(
			{
				"creator._id": friend._id,
				status: "ended",
			},
			{ _id: 1, category: 1, creator: 1, players: 1, gameType: 1, createdAt: 1 }
		);

		return success("ok", { friend, liveGames, endedGames });
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

		if (!answer) {
			return fail("invalid answer!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (!game.status === "started") {
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

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});

		if (
			game.questions[questionIndex].answers.length ===
			parseInt(numberOfPlayersSetting?.value || 5)
		) {
			// emit next question
			io.to(game._id.toString()).emit("next step", {});
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

		if (!game.status === "started") {
			return fail("game is not started yet!");
		}

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});

		if (parseInt(step) > parseInt(numberOfPlayersSetting?.value || "5")) {
			return fail("questions are finished!", {
				step,
				nop: numberOfPlayersSetting?.value || "5",
			});
		}

		const questionObject = game.questions[step - 1];
		const question = questionObject?.question;
		const answers = questionObject?.answers;
		let myAnswer = answers.find((element) => {
			element.user_id.toString() === userId.toString();
		})?.answer;

		return success("ok", {
			step,
			_id: questionObject.user_id,
			question,
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

		rates.forEach(async function (element) {
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
					},
					{
						new: true,
					}
				);
			} else {
				game = await Game.findOneAndUpdate(
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
					},
					{
						new: true,
					}
				);
			}
		});

		// check if all users has rated, go to the next step
		let ratesCount = 0;
		const answers = game.questions[questionIndex].answers;
		for (let index = 0; index < answers.length; index++) {
			const element = answers[index];
			ratesCount += element.rates.length;
		}

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});
		const playersCount = parseInt(numberOfPlayersSetting?.value || 5);

		if (ratesCount == playersCount * playersCount) {
			// everyone has answered, emit next question
			io.to(game._id.toString()).emit("next step", {});
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

		rates.forEach(async function (element) {
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
					},
					{
						new: true,
					}
				);
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
					},
					{
						new: true,
					}
				);
			}
		});

		// check if all users has rated, go to the next step
		let ratesCount = 0;
		const gameQuestions = game.questions;
		for (let index = 0; index < gameQuestions.length; index++) {
			const element = gameQuestions[index];
			ratesCount += element.rates.length;
		}

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});
		const playersCount = parseInt(numberOfPlayersSetting?.value || 5);

		if (ratesCount == playersCount * playersCount) {
			// everyone has answered, emit next question
			io.to(game._id.toString()).emit("result", {});
		}

		return success("Thank you for the rates", ratesCount);
	} catch (e) {
		return handleException(e);
	}
};

// tested

exports.showREsult = async (gameId) => {
	try {
		if (!gameId) {
			return fail("invalid game id!");
		}
		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		return success("result is not ready yet!", gameProjection(game));
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
