const {
	handleException,
	createGameCode,
	joinUserToGameRoom,
	objectId,
	leaveRoom,
	generateQR,
	xpNeededForNextLevel,
	scoreNeededForNextCheckpoint,
	shuffleArray,
} = require("../../helpers/utils");
const { validateEmail } = require("../../helpers/validator");
const {
	createModes,
	gameTypes,
	gameStatuses,
	notificationTypes,
	notificationDataTypes,
	coinTypes,
	transactionTypes,
	gameTypeNames,
} = require("../../helpers/constants");
const Category = require("../../models/Category");
const Game = require("../../models/Game");
const Question = require("../../models/Question");
const Setting = require("../../models/Setting");
const User = require("../../models/User");
const { sendNotification } = require("./NotificationController");
const sendEmail = require("../../services/mail");
const {
	inviteGameHtml,
	inviteGameHtmlFa,
} = require("../../views/templates/html/inviteGame");
const { addCoinTransaction } = require("./TransactionController");
const CharityCategory = require("../../models/CharityCategory");
const SurvivalLeague = require("../../models/SurvivalLeague");
const { detectLanguage } = require("../../services/openai");

const createOrGetQuestion = async (
	questionId,
	user,
	category,
	question,
	answer,
	currentBalance
) => {
	try {
		if (questionId) {
			const questionObject = await Question.findById(questionId);
			if (questionObject) {
				// check if this is from public questions, consider the price
				if (!questionObject.user) {
					// public question
					const publicQuestionFee = await Setting.findOne({
						key: "PUBLIC_QUESTION_USAGE_FEE",
					});
					const publicQuestionFeeValue = parseInt(
						publicQuestionFee?.value || 5
					);

					// if user has enough balance, decrease from their balance
					if (currentBalance <= publicQuestionFeeValue) {
						return fail(
							"Unfortunately you do not have enough coins to use this question!"
						);
					}
					const updatedUser = await User.findByIdAndUpdate(
						user._id,
						{
							$inc: { "assets.coins.bronze": -publicQuestionFeeValue },
						},
						{ new: true }
					);
					await addCoinTransaction(
						transactionTypes.DECREASE,
						"Use Public Question",
						{ price: publicQuestionFeeValue, coin: coinTypes.BRONZE },
						user._id,
						updatedUser.assets.coins
					);
				}

				return success("ok", {
					question_id: objectId(questionId),
					question_language: questionObject.language,
				});
			}
		}

		// create question first
		const {
			_id,
			firstName,
			lastName,
			email,
			profilePicture,
			playAnonymously,
			anonymousName,
		} = user;

		const language = await detectLanguage(question);
		const questionObject = new Question({
			category: {
				_id: category._id,
				name: category.name,
				icon: category.icon,
			},
			language,
			question,
			answer,
			user: {
				_id,
				firstName: playAnonymously ? anonymousName : firstName,
				lastName: playAnonymously ? "" : lastName,
				email,
				profilePicture: playAnonymously ? "" : profilePicture,
			},
			score: 0,
			plays: 0,
			answers: 0,
			rates: 0,
			avgRate: 0,
			createdAt: moment(),
		});
		await questionObject.save();

		return success("ok", {
			question_id: questionObject._id,
			question_language: language,
		});
	} catch (e) {
		return handleException(e);
	}
};

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
		gameInviteList: game.inviteList,
		gameNumberOfPlayers: game.numberOfPlayers,
		gamePlayers: game.players.filter((plyr) => plyr.status === "connected"),
		gameNumberOfPlayers: game.numberOfPlayers,
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

		const keepScorePriceSetting = await Setting.findOne({
			key: "KEEP_SCORE_PRICE_BRONZE",
		});

		const answerWordsLimitationSetting = await Setting.findOne({
			key: "ANSWER_WORDS_LIMITATION",
		});

		const rateAnswersDurationSetting = await Setting.findOne({
			key: "RATE_ANSWERS_DURATION_SECONDS",
		});

		const rateQuestionsDurationSetting = await Setting.findOne({
			key: "RATE_QUESTIONS_DURATION_SECONDS",
		});

		const publicQuestionFeeSetting = await Setting.findOne({
			key: "PUBLIC_QUESTION_USAGE_FEE",
		});

		const categories = await Category.find({ isActive: true }).sort({
			order: 1,
		});

		const activeSurvivalLeague = await SurvivalLeague.findOne({
			isActive: true,
		});

		return success("initialize game parameters", {
			createModes,
			gameTypes: activeSurvivalLeague
				? gameTypes
				: [{ id: "normal", text: "Normal" }],
			numberOfPlayers: numberOfPlayers?.value || 5,
			gamePrice: { coin: coinTypes.BRONZE, count: createGamePrice?.value || 2 },
			eachStepDurationSeconds: eachStepDurationSetting?.value || 120,
			rateAnswersDurationSeconds: rateAnswersDurationSetting?.value || 120,
			rateQuestionsDurationSeconds: rateQuestionsDurationSetting?.value || 120,
			waitingTimeSeconds: waitingTimeSecondsSetting?.value || 120, // in wating room
			numberOfRetries: numberOfRetriesSetting?.value || 2, // in wating room
			keepScorePrice: {
				coin: coinTypes.BRONZE,
				count: keepScorePriceSetting?.value || 5,
			},
			publicQuestionFee: publicQuestionFeeSetting?.value || 5,
			answerWordsLimitation: answerWordsLimitationSetting?.value || 100,
			categories,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.createGame = async (params, socketId) => {
	try {
		const { id, gameType, createMode, category, questionId, question, answer } =
			params;

		let { players } = params;

		if (!socketId) {
			return fail(
				"Unable to create connection. please refresh the page and try again!"
			);
		}
		if (!id) {
			return fail("Invalid creator id!");
		}

		if (!gameType || !gameTypes.find((element) => element.id === gameType)) {
			return fail("Invalid game type!");
		}

		if (gameType === gameTypeNames.SURVIVAL) {
			// check there is an active survival league
			const activeSurvivalLeague = await SurvivalLeague.findOne({
				isActive: true,
			});
			if (!activeSurvivalLeague) {
				return fail(
					"Unfortunately there are no active survival leagues right now!"
				);
			}
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
		const playersShouldCount = numberOfPlayersSetting?.value || 5;

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

		let creator = await User.findById(id);
		if (!creator) {
			return fail("invalid creator!");
		}

		// check if creator has enough coin
		const createGamePriceSetting = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});
		const creatorBronzeCoins = parseInt(creator.assets.coins.bronze);
		const createGamePrice = parseInt(createGamePriceSetting?.value || 2);
		if (creatorBronzeCoins < createGamePrice) {
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
			playAnonymously,
			anonymousName,
		} = creator;

		const {
			status: questionStatus,
			message: questionMessage,
			data: questionData,
		} = await createOrGetQuestion(
			questionId,
			creator,
			dbCategory,
			question,
			answer,
			creatorBronzeCoins - createGamePrice // current balance
		);

		if (questionStatus === -1) {
			return fail(questionMessage);
		}

		let game = new Game({
			code: `G-${createGameCode()}`,
			creator: {
				_id: creator_id,
				firstName: playAnonymously ? anonymousName : firstName,
				lastName: playAnonymously ? "" : lastName,
				email: playAnonymously ? anonymousName : email,
				profilePicture,
			},
			createMode: createModes.find((element) => element.id === createMode),
			gameType: gameTypes.find((element) => element.id === gameType),
			category: dbCategory,
			inviteList: players || [],
			numberOfPlayers: playersShouldCount,
			players: [
				{
					_id: creator_id,
					firstName: playAnonymously ? anonymousName : firstName,
					lastName: playAnonymously ? "" : lastName,
					email: playAnonymously ? anonymousName : email,
					profilePicture,
					socketId,
					status: "connected",
				},
			],
			questions: [
				{
					_id: questionData.question_id,
					user_id: creator_id,
					language: questionData.question_language,
					question,
					answers: [
						{
							user_id: creator_id,
							answer,
							language: await detectLanguage(answer),
							rates: [],
							isEditing: false,
						},
					],
					rates: [],
				},
			],
			status: gameStatuses.CREATED,
			createdAt: moment(),
		});

		await game.save();

		const gameId = game._id.toString();

		if (!(await joinUserToGameRoom(socketId, gameId, email))) {
			await Game.findOneAndDelete(gameId);
			return fail("unable to create connection, please try again!");
		}

		// decrease creator coins
		creator = await User.findOneAndUpdate(
			{ _id: creator_id },
			{ $inc: { "assets.coins.bronze": -createGamePrice } },
			{ new: true }
		);
		await addCoinTransaction(
			transactionTypes.DECREASE,
			"Create Game Price",
			{
				price: createGamePrice,
				coin: coinTypes.BRONZE,
			},
			creator_id,
			creator.assets.coins
		);

		if (players) {
			// send invites to players via notification and email

			let invitedListHasChanged = false;
			// Notification
			for (let index = 0; index < players.length; index++) {
				const invitedEmail = players[index];
				if (validateEmail(invitedEmail)) {
					let invitedUser = await User.findOne({
						email: invitedEmail,
						isActive: true,
					});

					if (invitedUser) {
						let title = "New Game!";
						let message = `you have been invited to play this game created by ${creator.email}`;
						let data = { type: notificationDataTypes.GAME_INVITE, gameId };

						await sendNotification(
							invitedUser.socketId,
							notificationTypes.NOTIFICATION,
							{ id: gameId, title, message, data },
							invitedUser._id,
							true
						);

						// email
						sendEmail(
							invitedEmail,
							"game invitation",
							invitedUser.preferedLanguage === "fa"
								? inviteGameHtmlFa(
										`${env.frontAppUrl}/game/join?code=${game.code}`,
										`${firstName} ${lastName}`
								  )
								: inviteGameHtml(
										`${env.frontAppUrl}/game/join?code=${game.code}`,
										`${firstName} ${lastName}`
								  )
						);

						if (invitedUser.playAnonymously) {
							players[index] = invitedUser.anonymousName;
							invitedListHasChanged = true;
						}
					}
				}
			}
			if (invitedListHasChanged) {
				game = await Game.findByIdAndUpdate(
					gameId,
					{ inviteList: players },
					{ new: true }
				);
			}
		} else {
			// TODO: find players who match game criteria and send proper notification
			// e.g. you may be interested to play this game
		}

		return success("Game was created successfully!", {
			game: await gameCustomProjection(game),
			newBalance: creator.assets,
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
			createMode: 1,
			inviteList: 1,
			status: 1,
		};
		let game = await Game.findOne(
			{ code: { $regex: code, $options: "i" } },
			gameProjection
		);
		if (!game) {
			game = await Game.findById(code, gameProjection);
			if (!game) {
				return fail("Invalid Game!");
			}
		}

		if (game.status !== gameStatuses.CREATED) {
			return fail("this game is already started!", game.status);
		}

		if (game.creator._id.toString() === user._id) {
			return fail("You are already in this game!");
		}

		const emailOrAnonymousName = user.playAnonymously
			? user.anonymousName
			: user.email;
		if (
			["2", "3"].includes(game.createMode.id) &&
			!game.inviteList.includes(emailOrAnonymousName)
		) {
			// Players By me OR I'm in full control
			return fail(
				`Sorry, you (${emailOrAnonymousName}) are not invited to this game!`
			);
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
		const { id, gameId, questionId, question, answer } = params;

		if (!id) {
			return fail("Invalid player id!");
		}

		if (!gameId) {
			return fail("Game id is required!");
		}

		if (!question) {
			return fail("Enter a question!");
		}

		if (!answer) {
			return fail("Enter answer for the question!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player!");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		let gameStatus = game.status;
		if (gameStatus === gameStatuses.STARTED) {
			return fail("Sorry, Game is already started!");
		} else if (gameStatus === gameStatuses.ENDED) {
			return fail("Sorry, Game has already ended!");
		}

		// check player is not already in game
		if (
			game.players.find(
				(element) =>
					element._id.toString() === player._id.toString() &&
					element.status != "left"
			)
		) {
			return fail("You are already in this game!");
		}

		const emailOrAnonymousName = player.playAnonymously
			? player.anonymousName
			: player.email;
		if (
			["2", "3"].includes(game.createMode.id) &&
			!game.inviteList.includes(emailOrAnonymousName)
		) {
			// Players By me OR I'm in full control
			return fail(
				`Sorry, you (${emailOrAnonymousName}) are not invited to this game!`
			);
		}

		// check if player has enough coins
		const joinGamePriceSetting = await Setting.findOne({
			key: "JOIN_GAME_PRICE_BRONZE",
		});
		const playerBronzeCoins = parseInt(player.assets.coins.bronze);
		const joinGamePrice = parseInt(joinGamePriceSetting?.value || 2);
		if (playerBronzeCoins < joinGamePrice) {
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
			playAnonymously,
			anonymousName,
		} = player;

		const {
			status: questionStatus,
			message: questionMessage,
			data: questionData,
		} = await createOrGetQuestion(
			questionId,
			player,
			game.category,
			question,
			answer,
			playerBronzeCoins - joinGamePrice // current balance
		);

		if (questionStatus === -1) {
			return fail(questionMessage);
		}

		// update players coins
		const playerUser = await User.findOneAndUpdate(
			{ _id: player_id },
			{ $inc: { "assets.coins.bronze": -joinGamePrice } },
			{ new: true }
		);
		await addCoinTransaction(
			transactionTypes.DECREASE,
			"Join Game Price",
			{ price: joinGamePrice, coin: coinTypes.BRONZE },
			player_id,
			playerUser.assets.coins
		);

		const gameRoom = game._id.toString();
		await joinUserToGameRoom(socketId, gameRoom, email);
		io.to(gameRoom).emit("player added", {
			_id: player_id,
			firstName: playAnonymously ? anonymousName : firstName,
			lastName: playAnonymously ? "" : lastName,
			email: emailOrAnonymousName,
			profilePicture,
		});

		const currentPlayersCount = game.players.length;
		let isStarted = false;
		if (parseInt(game.numberOfPlayers) === currentPlayersCount + 1) {
			isStarted = true;
		}

		game = await Game.findOneAndUpdate(
			{ _id: game.id },
			{
				$push: {
					players: {
						_id: player_id,
						firstName: playAnonymously ? anonymousName : firstName,
						lastName: playAnonymously ? "" : lastName,
						email: emailOrAnonymousName,
						profilePicture: profilePicture,
						socketId,
						status: "connected",
					},
					questions: {
						_id: questionData.question_id,
						user_id: player_id,
						question,
						language: questionData.question_language,
						answers: [
							{
								user_id: player_id,
								answer,
								language: await detectLanguage(answer),
								rates: [],
								isEditing: false,
							},
						],
						rates: [],
					},
				},
				...(isStarted
					? { status: gameStatuses.STARTED, startedAt: moment() }
					: {}),
			},
			{ new: true }
		);

		if (isStarted || game.status === gameStatuses.STARTED) {
			// shuffle question
			const gameQuestions = game.questions;
			shuffleArray(gameQuestions);
			await Game.findByIdAndUpdate(game.id, { questions: gameQuestions });

			// emit game is started
			io.to(gameRoom).emit("start game", {});
			console.log("start game");

			// once again to make sure it is emitted to everyone
			setTimeout(() => {
				io.to(gameRoom).emit("start game", {});
			}, 1000);
		}

		return success("You have successfully joined the game!", {
			game: await gameCustomProjection(game),
			newBalance: playerUser.assets,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.searchUsers = async (text, myId) => {
	try {
		if (!text || text.length < 3) {
			return fail("Enter at least 3 characters");
		}

		const filter = { $regex: text, $options: "i" };

		const users = await User.find(
			{
				_id: { $ne: objectId(myId) },
				isActive: true,
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
				email: { $regex: email, $options: "i" },
				emailVerified: true,
				hasCompletedSignup: true,
				isActive: true,
			},
			{ _id: 1, firstName: 1, lastName: 1, profilePicture: 1 }
		);

		if (!friend) {
			return fail("No user is associated with this email address!");
		}

		const liveGames = await Game.find(
			{
				"players._id": friend._id,
				status: gameStatuses.CREATED,
				"createMode.id": { $in: ["0", "1"] }, // players are random
			},
			{ _id: 1, code: 1, category: 1, creator: 1, players: 1, gameType: 1 }
		);

		const endedGames = await Game.find({
			"players._id": friend._id,
			status: gameStatuses.ENDED,
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
		if (!player || !player.isActive) {
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

		if (game.status !== gameStatuses.CREATED) {
			return fail("You are not allowed to invite in this step!");
		}

		// check this email is not in neither inviteList nor players
		if (
			// game.inviteList.findIndex((il) => il === email) >= 0 ||
			game.players.findIndex((p) => p.email === email && p.status != "left") >=
			0
		) {
			return fail(
				"This email address is already in either invite list or players."
			);
		}

		let playerUser = await User.findOne({ email, isActive: true });
		if (playerUser) {
			await Game.findOneAndUpdate(
				{ _id: objectId(gameId) },
				{ $push: { inviteList: email } }
			);

			let title = "New Game!";
			let message = `you have been invited to play this game created by ${game.creator.email}`;
			let data = { type: "GAME_INVITE", gameId };

			await sendNotification(
				playerUser.socketId,
				notificationTypes.NOTIFICATION,
				{ id: gameId, title, message, data },
				playerUser._id,
				true
			);

			return success(`Invitation was sent to ${email} successfully!`);
		} else {
			return fail("Invalid player");
		}
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

		if (game.status !== gameStatuses.STARTED) {
			return fail("game is not started yet!");
		}

		const notLeftPlayers = game.players.filter(
			(plyr) => plyr.status !== "left"
		);

		if (parseInt(step) > notLeftPlayers.length) {
			return fail(
				"questions are finished!",
				{
					step,
					nop: game.players.length,
				},
				-2 // status
			);
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
			language: questionObject.language || env.defaultLanguage,
			myAnswer,
		});
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

		if (game.status !== gameStatuses.STARTED) {
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
						isEditing: false,
						language: await detectLanguage(answer),
						rates: [],
					},
				},
			};
			arrayFilters = [{ "i.user_id": objectId(questionId) }];
		} else {
			// edit answer
			updateQuery = {
				$set: {
					"questions.$[i].answers.$[j].answer": answer,
					"questions.$[i].answers.$[j].isEditing": false,
				},
			};
			arrayFilters = [
				{ "i.user_id": objectId(questionId) },
				{ "j.user_id": objectId(id) },
			];
		}

		game = await Game.findOneAndUpdate(findQuery, updateQuery, {
			arrayFilters,
			new: true,
		});

		const numberOfSubmitted =
			game.questions[questionIndex].answers.filter((a) => a.isEditing === false)
				?.length || 0;
		const numberOfPlayers = game.players.filter(
			(plyr) => plyr.status !== "left"
		).length;
		const numberOfConnectedPlayers = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;

		if (numberOfSubmitted >= numberOfConnectedPlayers) {
			// emit next question
			io.to(gameId).emit("next step", {});
			console.log("next step: rate answers");
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted,
				numberOfPlayers,
				numberOfConnectedPlayers,
			});
			console.log("submit answer");
		}

		return success("Thank you for the answer.");
	} catch (e) {
		return handleException(e);
	}
};

exports.editAnswer = async (params) => {
	try {
		const { id, gameId, questionId } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}

		if (!questionId) {
			return fail("invalid question id!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player");
		}

		let game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.status !== gameStatuses.STARTED) {
			return fail("You can not edit your answer now!");
		}

		await Game.findByIdAndUpdate(
			gameId,
			{
				$set: {
					"questions.$[i].answers.$[j].isEditing": true,
				},
			},
			{
				arrayFilters: [
					{ "i.user_id": objectId(questionId) },
					{ "j.user_id": objectId(id) },
				],
				new: true,
			}
		);

		return success("ok");
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
					language: element.language || env.defaultLanguage,
				};
			}
		);

		shuffleArray(answers);

		return success("ok", {
			questionId,
			question: gameQuestions[questionIndex]?.question,
			questionLanguage: gameQuestions[questionIndex]?.language,
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
		if (game.status !== gameStatuses.STARTED) {
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
			(plyr) => plyr.status !== "left"
		).length;
		const connectedPlayersCount = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;

		// if (ratesCount >= playersCount * playersCount) {
		if (ratesCount >= connectedPlayersCount * connectedPlayersCount) {
			// everyone has answered, emit next question
			io.to(gameId).emit("next step", {});
			console.log("next step: next question");
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted: Math.floor(ratesCount / playersCount),
				numberOfPlayers: playersCount,
				numberOfConnectedPlayers: connectedPlayersCount,
			});
			console.log("submit answer rates");
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
				language: element.language,
			};
		});

		shuffleArray(questions);

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
		if (game.status !== gameStatuses.STARTED) {
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
			(plyr) => plyr.status !== "left"
		).length;
		const connectedPlayersCount = game.players.filter(
			(plyr) => plyr.status === "connected"
		).length;

		// if (ratesCount === playersCount * playersCount) {
		if (ratesCount >= connectedPlayersCount * connectedPlayersCount) {
			// everyone has answered, calculate and emit result!
			calculateResult(gameId);
		} else {
			io.to(gameId).emit("submit answer", {
				numberOfSubmitted: Math.floor(ratesCount / playersCount),
				numberOfPlayers: playersCount,
				numberOfConnectedPlayers: connectedPlayersCount,
			});
			console.log("submit question rates");
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
		if (game.status !== gameStatuses.ENDED) {
			return success("game is not ended yet!", gameCustomProjection(game));
		}

		if (game.result) {
			const { code, creator, category, gameType, startedAt, endedAt, result } =
				game;

			let statistics = {};
			let nextCheckpoint = scoreNeededForNextCheckpoint(0);
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
						xp: playerScoreboard?.totalXP,
						reward: playerScoreboard?.reward,
					};

					nextCheckpoint = scoreNeededForNextCheckpoint(
						user.statistics.survival.checkpoint
					);
				}
			}

			return success("ok", {
				code,
				creator,
				category,
				gameType,
				startedAt,
				endedAt,
				result,
				statistics,
				nextCheckpoint,
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

		const gameStatusBeforeUpdates = game.status;

		if (
			![gameStatuses.CREATED, gameStatuses.STARTED].includes(
				gameStatusBeforeUpdates
			)
		) {
			return fail("You can not leave in this step!");
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
			console.log("cancel game");
		} else {
			// remove player from game
			leaveRoom(socketId, gameId, email);
			io.to(gameId).emit("player left", {
				_id: player_id,
				firstName,
				lastName,
				email,
				profilePicture,
			});
		}

		// TODO: shift rates properly

		// update player and game status and remove player question
		game = await Game.findByIdAndUpdate(
			gameId,
			{
				"players.$[player].status": "left",
				...(canceled
					? { status: gameStatuses.CANCELED, canceledAt: moment() }
					: {}),
				$pull: {
					questions: { user_id: player_id },
				},
			},
			{ arrayFilters: [{ "player._id": player_id }], new: true }
		);

		// remove player question rates
		game = await Game.findByIdAndUpdate(
			gameId,
			{
				$pull: {
					"questions.$[].rates": { user_id: player_id },
				},
			},
			{ new: true }
		);

		// remove player answers
		game = await Game.findByIdAndUpdate(
			gameId,
			{
				$pull: {
					"questions.$[].answers": { user_id: player_id },
				},
			},
			{ new: true }
		);

		// remove player answers rates
		game = await Game.findByIdAndUpdate(
			gameId,
			{
				$pull: {
					"questions.$[].answers.$[].rates": {
						user_id: player_id,
					},
				},
			},
			{ new: true }
		);

		if (canceled) {
			await this.refundPlayers(game, gameStatusBeforeUpdates);
		}

		return success("ok");
	} catch (e) {
		return handleException(e);
	}
};

exports.playerDisconnected = async (params) => {
	const { id, gameId } = params;
	if (!id) {
		console.log("invalid user id!");
		return;
	}

	if (!gameId) {
		console.log("invalid game id!");
		return;
	}
	let game = await Game.findById(gameId);
	if (!game) {
		console.log("invalid game!");
		return;
	}

	const player = await User.findById(id);
	if (!player) {
		console.log("invalid player!");
		return;
	}

	const { _id: player_id, firstName, lastName, email, profilePicture } = player;

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

	console.log(`${email} disconnected from ${gameId}`);
};

exports.reconnectPlayer = async (userId, socketId) => {
	if (!userId) {
		console.log("reconnecting to game ... invalid user id!");
		return;
	}

	if (!socketId) {
		console.log("reconnecting to game ... invalid socket id!");
		return;
	}

	const player = await User.findById(userId);
	if (!player) {
		console.log("invalid player to re-join!");
		return;
	}

	await User.findByIdAndUpdate(userId, { socketId });

	const userGamesFilter = {
		"players._id": objectId(userId),
		status: { $in: [gameStatuses.CREATED, gameStatuses.STARTED] },
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

		const {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = player;

		// join user to still existing game rooms
		for (const game of games) {
			const room = game._id.toString();
			await joinUserToGameRoom(socketId, room, email);
			// emit player connected
			io.to(room).emit("player connected", {
				_id: player_id,
				firstName,
				lastName,
				email,
				profilePicture,
			});
		}
	}
};

exports.keepMyScore = async (params) => {
	try {
		// increase total score and adjusted score
		const { id, gameId } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		if (!gameId) {
			return fail("invalid game id!");
		}

		const game = await Game.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.gameType.id !== "survival") {
			return fail("invalid operation!");
		}

		const keepScorePriceSetting = await Setting.findOne({
			key: "KEEP_SCORE_PRICE_BRONZE",
		});
		const keepScorePrice = parseInt(keepScorePriceSetting?.value || 5);

		let user = await User.findById(id);

		const { avgRank, totalScore, checkpoint } = user.statistics.survival;
		const playerScoreborad = game.result.scoreboard.find(
			(s) => s._id === user._id
		);
		const thisGameScore = playerScoreborad?.totalScore || 0;
		const newTotalScore = totalScore + thisGameScore;
		let updateCheckpoint = false;
		// update checkpoint if applicable
		const _scoreNeededForNextCheckpoint =
			scoreNeededForNextCheckpoint(checkpoint);
		if (newTotalScore > _scoreNeededForNextCheckpoint) {
			updateCheckpoint = true;
		}

		user = await User.findOneAndUpdate(
			{ _id: objectId(id) },
			{
				"statistics.survival.adjustedScore":
					(1.2 - avgRank / 25) * newTotalScore,
				$inc: {
					"assets.coins.bronze": -keepScorePrice,
					"statistics.survival.totalScore": thisGameScore,
					"statistics.survival.rebuys": 1,
					...(updateCheckpoint ? { "statistics.survival.checkpoint": 1 } : {}),
				},
			},
			{ new: true }
		);
		await addCoinTransaction(
			transactionTypes.DECREASE,
			"Keep My Score",
			{ price: keepScorePrice, coin: coinTypes.BRONZE },
			objectId(id),
			user.assets.coins
		);
		return success("ok", { newBalance: user.assets });
	} catch (e) {
		return handleException(e);
	}
};

exports.backToCheckpoint = async () => {
	// do nothing
	return success("ok");
};

exports.forceCalculateResult = async (gameId) => {
	try {
		await calculateResult(gameId);
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
			const ownQuestionIndex = questions.findIndex((element) => {
				return element.user_id.toString() === player._id.toString();
			});

			// ================ new aproach ================
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				const questionWeight =
					1 +
					(question.rates.find(
						(r) => r.user_id.toString() === player._id.toString()
					)?.rate || 1) /
						100; // 1 => 1.01, 5 => 1.05

				for (const qAnswer of question.answers) {
					for (const aRate of qAnswer.rates) {
						if (aRate.user_id.toString() === player._id.toString()) {
							aRate.weightedRate = (aRate.rate || 1.01) * questionWeight;
						} else {
							aRate.weightedRate = aRate.rate || 1.01;
						}
					}
				}
			}

			const answersRates = [];
			const answersRatesRaw = [];
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];

				const answer = question.answers.find(
					(elm) => elm.user_id.toString() === player._id.toString()
				);
				const sumRates =
					answer?.rates.reduce((n, { rate }) => n + rate, 0) || numberOfPlayers;
				answersRatesRaw.push(sumRates);

				// ================ Old aproach ================
				// answersRates.push(sumRates * questionWeight);

				// ================ new aproach ================
				const sumWeightedRates =
					answer?.rates.reduce((n, { weightedRate }) => n + weightedRate, 0) ||
					numberOfPlayers;

				answersRates.push(sumWeightedRates);
			}

			const questionRate = questions[ownQuestionIndex].rates.reduce(
				(n, { rate }) => n + rate,
				0
			);

			const totalScore = answersRates.reduce((acc, cur) => acc + cur);

			return {
				_id: player._id,
				firstName: player.firstName,
				lastName: player.lastName,
				profilePicture: player.profilePicture,
				answersRates: answersRatesRaw,
				questionRate,
				totalScore,
				totalXP: totalScore * 15,
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
				languages: answerObj.language || env.defaultLanguage,
				rate: answerObj.rates.reduce((n, { rate }) => n + rate, 0),
			};
		});

		updateQuestionStatistics(questionObj);

		return {
			questioner,
			question: questionObj.question,
			language: questionObj.language || env.defaultLanguage,
			rate: questionObj.rates.reduce((n, { rate }) => n + rate, 0),
			answers,
		};
	});
	const gameType = game.gameType;

	const winnerRewardSetting = await Setting.findOne({
		key: "GAME_WINNER_REWARD_BRONZE",
	});

	const secondPlaceRewardSetting = await Setting.findOne({
		key: "SECOND_PLACE_REWARD_BRONZE",
	});

	const thirdPlaceRewardSetting = await Setting.findOne({
		key: "THIRD_PLACE_REWARD_BRONZE",
	});

	let rank = 1;
	// update users statistics
	for (const item of scoreboard) {
		// reward first three places
		if (rank === 1) {
			item.reward.bronze = winnerRewardSetting?.value || 1;
		} else if (rank === 2) {
			item.reward.bronze = secondPlaceRewardSetting?.value || 1;
		} else if (rank === 3) {
			item.reward.bronze = thirdPlaceRewardSetting?.value || 1;
		}

		const plyr = await User.findById(item._id);
		item["avgRank"] = plyr.statistics.survival?.avgRank || 0;
		const playerHighScore = plyr.games.highScore || 0;
		const currentXp = (plyr.statistics.totalXP || 0) + item.totalXP; // 450 + 150 = 600
		let level = plyr.statistics.level || 0; // 0
		let currentLevelXP = plyr.statistics.currentLevelXP || 0;
		let _xpNeededForNextLevel = plyr.statistics.xpNeededForNextLevel; // xpNeededForNextLevel(level); // 500

		let shouldUpdateLevel = false;

		if (parseInt(currentXp) >= parseInt(_xpNeededForNextLevel)) {
			// update level and xpNeededForNextLevel
			shouldUpdateLevel = true;
			level++; // 1
			currentLevelXP = _xpNeededForNextLevel;
			_xpNeededForNextLevel = xpNeededForNextLevel(level); // 1000

			// send notification for updated level
			const playerSocketId = players.find(
				(elm) => elm._id === item._id
			)?.socketId;

			await sendNotification(
				playerSocketId,
				notificationTypes.NOTIFICATION_MODAL,
				{
					title: "Level Up!",
					message: `Congratulations! You have reached level ${level}!`,
					icon: "",
				}
			);
		}

		const $inc = {
			"statistics.totalXP": item.totalXP,
			"games.played": 1,
			...(gameType.id === "normal"
				? {
						"statistics.normal.totalScore": item.totalScore,
				  }
				: {}),
		};

		await User.findOneAndUpdate(
			{ _id: item._id },
			{
				...(shouldUpdateLevel
					? {
							"statistics.level": level,
							"statistics.currentLevelXP": currentLevelXP,
							"statistics.xpNeededForNextLevel": _xpNeededForNextLevel,
					  }
					: {}),
				"games.highScore":
					item.totalScore > playerHighScore ? item.totalScore : playerHighScore,
				$inc,
			}
		);

		if (gameType.id === "survival") {
			await implementSurvivalResult(
				item._id,
				plyr.statistics.survival,
				plyr.games.survivalGamesPlayed,
				rank,
				item.questionRate,
				item.totalScore
			);
		}

		rank++;
	}

	// update winner statistics and assets
	const winnerReward = parseInt(winnerRewardSetting?.value || 1);
	const winnerId = scoreboard[0]._id;
	const winnerUser = await User.findOneAndUpdate(
		{ _id: winnerId },
		{
			$inc: {
				"games.won": 1,
				"assets.coins.bronze": winnerReward,
			},
		},
		{
			new: true,
		}
	);
	await addCoinTransaction(
		transactionTypes.INCREASE,
		"Winner Reward",
		{ price: winnerReward, coin: coinTypes.BRONZE },
		winnerId,
		winnerUser.assets.coins
	);

	// update second place assets
	const secondPlaceReward = parseInt(secondPlaceRewardSetting?.value || 1);
	const secondPlaceId = scoreboard[1]._id;
	const secondPlaceUser = await User.findOneAndUpdate(
		{ _id: secondPlaceId },
		{
			$inc: {
				"assets.coins.bronze": secondPlaceReward,
			},
		},
		{ new: true }
	);
	await addCoinTransaction(
		transactionTypes.INCREASE,
		"Second Place Reward",
		{ price: secondPlaceReward, coin: coinTypes.BRONZE },
		secondPlaceId,
		secondPlaceUser.assets.coins
	);

	// update third place assets
	const thirdPlaceReward = parseInt(thirdPlaceRewardSetting?.value || 1);
	const thirdPlaceId = scoreboard[2]?._id;
	const thirdPlaceUser = await User.findOneAndUpdate(
		{ _id: thirdPlaceId },
		{
			$inc: {
				"assets.coins.bronze": thirdPlaceReward,
			},
		},
		{ new: true }
	);
	if (thirdPlaceId) {
		await addCoinTransaction(
			transactionTypes.INCREASE,
			"Third Place Reward",
			{ price: thirdPlaceReward, coin: coinTypes.BRONZE },
			thirdPlaceId,
			thirdPlaceUser?.assets.coins
		);
	}

	// update creator statistics
	await User.findOneAndUpdate(
		{ _id: game.creator._id },
		{ $inc: { "games.created": 1 } }
	);

	const result = { scoreboard, details };
	await Game.findOneAndUpdate(
		{ _id: objectId(gameId) },
		{ status: gameStatuses.ENDED, endedAt: moment(), result }
	);

	updateCharityProgress(game.players);

	console.timeEnd("calculate-game-result");
	io.to(gameId).emit("end game", {});
	console.log("end game");

	// disconnect all players from game room
	for (const player of players) {
		leaveRoom(player.socketId, gameId, player.email);
	}

	return success("ok", result);
};

const implementSurvivalResult = async (
	_id,
	survivalStatistics,
	survivalGamesPlayed,
	rank,
	questionRate,
	itemTotalScore
) => {
	const { checkpoint, avgRank, avgQuestionScore, avgScore, totalScore } =
		survivalStatistics;
	const numberOfSurvivalGamesPlayed = survivalGamesPlayed;

	const newAvgRank =
		(avgRank * numberOfSurvivalGamesPlayed + rank) /
		(numberOfSurvivalGamesPlayed + 1);

	const newAvgQuestionScore =
		(avgQuestionScore * numberOfSurvivalGamesPlayed + questionRate) /
		(numberOfSurvivalGamesPlayed + 1);

	const newAvgScore =
		(avgScore * numberOfSurvivalGamesPlayed + itemTotalScore) /
		(numberOfSurvivalGamesPlayed + 1);

	let won = false;
	let updateCheckpoint = false;
	let newTotalScore = totalScore + itemTotalScore;

	if (checkpoint === 0 || rank <= avgRank) {
		// starter or win condition, update total score anyway
		won = true;

		// update checkpoint if applicable
		const _scoreNeededForNextCheckpoint =
			scoreNeededForNextCheckpoint(checkpoint);
		if (newTotalScore > _scoreNeededForNextCheckpoint) {
			updateCheckpoint = true;
		}
	} else if (checkpoint > 0 && rank > avgRank) {
		// lose condition
		// let user decide in later APIs
	}

	await User.findOneAndUpdate(
		{ _id },
		{
			"statistics.survival.avgRank": newAvgRank,
			"statistics.survival.avgQuestionScore": newAvgQuestionScore,
			"statistics.survival.avgScore": newAvgScore,
			...(won
				? {
						"statistics.survival.adjustedScore":
							(1.2 - newAvgRank / 25) * newTotalScore,
				  }
				: {}),
			$inc: {
				"games.survivalGamesPlayed": 1,
				...(won
					? { "statistics.survival.totalScore": itemTotalScore }
					: { "statistics.survival.loses": 1 }),
				...(updateCheckpoint ? { "statistics.survival.checkpoint": 1 } : {}),
			},
		}
	);
};

const updateQuestionStatistics = async (obj) => {
	// update score, plays, answers, rates, avgRate
	const questionId = objectId(obj._id);
	const question = await Question.findById(questionId);
	if (!question) {
		return;
	}

	const oldRates = question.rates || 0;
	const oldAvgRate = question.avgRate || 0;
	const currentRates = obj.rates?.length || 0;
	const currentAnswers = obj.answers?.length || 0;
	const questionScore = obj.rates.reduce((n, { rate }) => n + rate, 0);
	const newAvgRate =
		(oldRates * oldAvgRate + questionScore) / (oldRates + currentRates);

	await Question.findOneAndUpdate(
		{
			_id: questionId,
		},
		{
			$inc: {
				score: questionScore,
				plays: 1,
				answers: currentAnswers,
				rates: currentRates,
			},
			avgRate: newAvgRate,
		}
	);
};

const updateCharityProgress = async (players) => {
	const numberOfPlayers = players.length;
	// calculate and sum create and join fees
	const createGamePriceSetting = await Setting.findOne({
		key: "CREATE_GAME_PRICE_BRONZE",
	});
	const createGamePrice = parseInt(createGamePriceSetting?.value || 2);

	const joinGamePriceSetting = await Setting.findOne({
		key: "JOIN_GAME_PRICE_BRONZE",
	});
	const joinGamePrice = parseInt(joinGamePriceSetting?.value || 2);

	const gameTotalInputs =
		createGamePrice + (numberOfPlayers - 1) * joinGamePrice;

	// calculate and sum rewards
	const winnerRewardSetting = await Setting.findOne({
		key: "GAME_WINNER_REWARD_BRONZE",
	});

	const secondPlaceRewardSetting = await Setting.findOne({
		key: "SECOND_PLACE_REWARD_BRONZE",
	});

	const thirdPlaceRewardSetting = await Setting.findOne({
		key: "THIRD_PLACE_REWARD_BRONZE",
	});

	const shouldConsiderThirdPlaceReward = numberOfPlayers > 2;
	const rewards =
		parseInt(winnerRewardSetting?.value || 3) +
		parseInt(secondPlaceRewardSetting?.value || 2) +
		(shouldConsiderThirdPlaceReward
			? parseInt(thirdPlaceRewardSetting?.value || 1)
			: 0);

	const platformIncome = gameTotalInputs - rewards;
	console.log("platformIncome", platformIncome);
	if (platformIncome > 0) {
		// calculate one third of the platform income
		const bronzeCoinValueSetting = await Setting.findOne({
			key: "BRONZE_COIN_VALUE_DOLLAR",
		});
		const bronzeCoinValue = parseFloat(bronzeCoinValueSetting?.value || 0.2);
		const oneThirdOfThePlatformIncome = (platformIncome / 3) * bronzeCoinValue;
		const eachPlayerShare = oneThirdOfThePlatformIncome / numberOfPlayers;
		console.log("eachPlayerShare", eachPlayerShare);

		// assign to users charity chosen activity
		for (const player of players) {
			const playerUser = await User.findById(player._id);
			if (playerUser.preferedCharity) {
				await CharityCategory.findByIdAndUpdate(
					playerUser.preferedCharity.charity?._id,
					{
						$inc: { "activities.$[i].progress": eachPlayerShare },
					},
					{
						arrayFilters: [
							{ "i._id": playerUser.preferedCharity.activity?._id },
						],
					}
				);
			} else {
				// if user has not chosen charity activity, progress the default charity and default activity
				await CharityCategory.findOneAndUpdate(
					{ isDefault: true },
					{
						$inc: { "activities.$[i].progress": eachPlayerShare },
					},
					{
						arrayFilters: [{ "i.isDefault": true }],
					}
				);
			}
		}
	}
};

exports.refundPlayers = async (game, gameStatusBeforeUpdates) => {
	// refund join game price to players rather than who is leaving
	// and everyone who are connected rather than game creator

	const joinGamePriceSetting = await Setting.findOne({
		key: "JOIN_GAME_PRICE_BRONZE",
	});
	const joinGamePrice = parseInt(joinGamePriceSetting?.value || 2);

	// if game has not started yet, refund all
	// otherwise, refund connected or disconnected players but not left players
	const connectedJoinedPlayers = game.players.filter(
		(plyr) =>
			(plyr.status !== "left" &&
				plyr._id.toString() !== game.creator._id.toString()) ||
			(gameStatusBeforeUpdates === gameStatuses.CREATED &&
				plyr._id.toString() !== game.creator._id.toString())
	);

	const connectedJoinedPlayersIds = [];
	for (const i of connectedJoinedPlayers) {
		connectedJoinedPlayersIds.push(i._id);
	}

	await User.updateMany(
		{ _id: { $in: connectedJoinedPlayersIds } },
		{ $inc: { "assets.coins.bronze": joinGamePrice } }
	);

	for (const i of connectedJoinedPlayers) {
		const connectedJoinedPlayerId = i._id;

		const connectedJoinedPlayer = await User.findById(connectedJoinedPlayerId);

		await addCoinTransaction(
			transactionTypes.INCREASE,
			"Refund due to canceled game",
			{ price: joinGamePrice, coin: coinTypes.BRONZE },
			connectedJoinedPlayerId,
			connectedJoinedPlayer.assets.coins
		);
	}

	// refund creator if he/she is still connected, or game has not started yet
	let creator = game.players.find(
		(plyr) =>
			plyr._id.toString() === game.creator._id.toString() &&
			(plyr.status !== "left" ||
				gameStatusBeforeUpdates === gameStatuses.CREATED)
	);

	if (creator) {
		const createGamePriceSetting = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});
		const createGamePrice = parseInt(createGamePriceSetting?.value || 2);

		creator = await User.findOneAndUpdate(
			{ _id: creator._id },
			{ $inc: { "assets.coins.bronze": createGamePrice } },
			{ new: true }
		);

		await addCoinTransaction(
			transactionTypes.INCREASE,
			"Refund due to canceled game",
			{ price: createGamePrice, coin: coinTypes.BRONZE },
			creator._id,
			creator.assets.coins
		);
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
