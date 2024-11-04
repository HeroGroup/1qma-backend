const {
	gameStatuses,
	registerQuestionTypes,
} = require("../../helpers/constants");
const {
	handleException,
	createGameCode,
	objectId,
	shuffleArray,
} = require("../../helpers/utils");

const Category = require("../../models/Category");
const RegisterQuestion = require("../../models/RegisterQuestion");
const Setting = require("../../models/Setting");
const TutorialGame = require("../../models/TutorialGame");
const TutorialGamePlayer = require("../../models/TutorialGamePlayer");
const User = require("../../models/User");

const { askAI } = require("../../services/openai");

exports.init = async () => {
	try {
		const numberOfPlayers = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_NUMBER_OF_PLAYERS",
		});

		const eachStepDurationSetting = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_STEP_DURATION_SECONDS",
		});

		const answerWordsLimitationSetting = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_ANSWER_WORDS_LIMITATION",
		});

		const rateAnswersDurationSetting = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_RATE_ANSWERS_DURATION_SECONDS",
		});

		const rateQuestionsDurationSetting = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_RATE_QUESTIONS_DURATION_SECONDS",
		});

		const categories = await Category.find({ isActive: true });
		const randomIndex = Math.floor(Math.random() * categories.length);
		const category = categories[randomIndex];

		return success("initialize game parameters", {
			numberOfPlayers: numberOfPlayers?.value || 5,
			eachStepDurationSeconds: eachStepDurationSetting?.value || 120,
			rateAnswersDurationSeconds: rateAnswersDurationSetting?.value || 120,
			rateQuestionsDurationSeconds: rateQuestionsDurationSetting?.value || 120,
			answerWordsLimitation: answerWordsLimitationSetting?.value || 100,
			category,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.createGame = async (params) => {
	try {
		const { id, category, question, answer } = params;

		if (!id) {
			return fail("Invalid user id!");
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

		const dbCategory = await Category.findById(category);
		if (!dbCategory) {
			return fail("Invalid category!");
		}

		let creator = await User.findById(id);
		if (!creator) {
			return fail("invalid creator!");
		}

		const {
			_id: creator_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = creator;

		const tutorialGamePlayers = await TutorialGamePlayer.find();
		shuffleArray(tutorialGamePlayers);

		const numberOfPlayersSetting = await Setting.findOne({
			key: "TUTORIAL_GAMEPLAY_NUMBER_OF_PLAYERS",
		});
		const playersShouldCount = numberOfPlayersSetting?.value || 5;

		const players = [
			{
				_id: creator_id,
				firstName,
				lastName,
				email,
				profilePicture,
			},
			...tutorialGamePlayers.slice(0, playersShouldCount - 1),
		];

		const registerQuestions = await RegisterQuestion.find({
			type: registerQuestionTypes.TEXT,
			isActive: true,
		});
		shuffleArray(registerQuestions);

		const robotQuestions = [];
		for (let index = 1; index < playersShouldCount; index++) {
			const player_id = players[index]._id;
			const robotQuestion = registerQuestions[index - 1]?.question;
			robotQuestions.push({
				user_id: player_id,
				question: robotQuestion,
				answers: [
					{
						user_id: player_id,
						answer: await askAI(robotQuestion),
					},
				],
			});
		}

		const questions = [
			{
				user_id: creator_id,
				question,
				answers: [
					{
						user_id: creator_id,
						answer,
					},
				],
			},
			...robotQuestions,
		];

		shuffleArray(questions);

		const tutorialGame = new TutorialGame({
			code: `G-${createGameCode()}`,
			creator: { _id: creator_id, firstName, lastName, email, profilePicture },
			category: dbCategory,
			numberOfPlayers: playersShouldCount,
			players,
			questions,
			status: gameStatuses.CREATED,
			createdAt: moment(),
		});

		await tutorialGame.save();

		return success("ok", tutorialGame);
	} catch (e) {
		return handleException(e);
	}
};

exports.startGame = async (params) => {
	try {
		const { id, gameId } = params;

		if (!id) {
			return fail("Invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}

		await TutorialGame.findByIdAndUpdate(gameId, {
			status: gameStatuses.STARTED,
			startedAt: moment(),
		});

		return success("ok");
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

		const game = await TutorialGame.findById(gameId);
		if (!game) {
			return fail("invalid game");
		}

		if (game.status !== gameStatuses.STARTED) {
			return fail("game is not started yet!");
		}

		if (parseInt(step) > game.players.length) {
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

exports.submitAnswer = async (params, language) => {
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

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player");
		}

		let game = await TutorialGame.findById(gameId);
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

		const players = game.players;
		const rates = [];
		for (let index = 1; index < players.length - 1; index++) {
			rates.push({
				user_id: players[index]._id,
				rate: index,
			});
		}

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
						language,
						rates,
					},
				},
			};
			arrayFilters = [{ "i.user_id": objectId(questionId) }];
		} else {
			// edit answer
			updateQuery = {
				$set: {
					"questions.$[i].answers.$[j].answer": answer,
				},
			};
			arrayFilters = [
				{ "i.user_id": objectId(questionId) },
				{ "j.user_id": objectId(id) },
			];
		}

		await TutorialGame.findOneAndUpdate(findQuery, updateQuery, {
			arrayFilters,
		});

		const question = game.questions[questionIndex]?.question;
		for (let i = 1; i < players.length; i++) {
			const robot = players[i];

			await TutorialGame.findOneAndUpdate(findQuery, {
				$push: {
					"questions.$[i].answers": {
						user_id: robot._id,
						answer: await askAI(question),
						isEditing: false,
						language,
					},
				},
			});
		}

		return success("Thank you for the answer.");
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

		const game = await TutorialGame.findById(gameId);
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

		let game = await TutorialGame.findById(gameId);
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
				game = await TutorialGame.findOneAndUpdate(
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
				game = await TutorialGame.findOneAndUpdate(
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

		// robots rate answer here
		const _rates = [
			{
				answer_id: players[0]._id,
				rate: playersShouldCount,
			},
		];
		for (let index = 1; index < playersShouldCount - 1; index++) {
			_rates.push({
				answer_id: players[index]._id,
				rate: index,
			});
		}

		const gamePlayers = game.players;
		for (let i = 1; i < gamePlayers.length; i++) {
			const player = gamePlayers[i];

			for (const element of _rates) {
				game = await TutorialGame.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						$push: {
							"questions.$[i].answers.$[j].rates": {
								user_id: player._id,
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
			}
		}
		// end robots rating

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
		const game = await TutorialGame.findById(gameId);
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

		let game = await TutorialGame.findById(gameId);
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
				game = await TutorialGame.findOneAndUpdate(
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
				game = await TutorialGame.findOneAndUpdate(
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

		// robots rate questions here
		const _rates = [
			{
				question_id: players[0]._id,
				rate: playersShouldCount,
			},
		];
		for (let index = 1; index < playersShouldCount - 1; index++) {
			_rates.push({
				question_id: players[index]._id,
				rate: index,
			});
		}

		const gamePlayers = game.players;
		for (let i = 1; i < gamePlayers.length; i++) {
			const player = gamePlayers[i];

			for (const element of _rates) {
				await TutorialGame.findOneAndUpdate(
					{ _id: objectId(gameId) },
					{
						$push: {
							"questions.$[i].rates": {
								user_id: player._id,
								rate: element.rate,
							},
						},
					},
					{
						arrayFilters: [{ "i.user_id": objectId(element.question_id) }],
					}
				);
			}
		}
		// end robots rating

		calculateResult(gameId);

		await User.findByIdAndUpdate(id, { "hasSeenIntros.tutorial": true });

		return success("Thank you for the rates", ratesCount);
	} catch (e) {
		return handleException(e);
	}
};

exports.showResult = async (gameId) => {
	try {
		if (!gameId) {
			return fail("invalid game id!");
		}
		const game = await TutorialGame.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}
		if (game.status !== gameStatuses.ENDED) {
			return success("game is not ended yet!");
		}

		if (game.result) {
			const { creator, category, startedAt, endedAt, result } = game;

			return success("ok", {
				creator,
				category,
				startedAt,
				endedAt,
				result,
			});
		} else {
			return fail("Result is not ready yet!");
		}
	} catch (e) {
		return handleException(e);
	}
};

exports.exitGame = async (params) => {
	try {
		const { id, gameId } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!gameId) {
			return fail("invalid game id!");
		}
		let game = await TutorialGame.findById(gameId);
		if (!game) {
			return fail("invalid game!");
		}

		if (![gameStatuses.CREATED, gameStatuses.STARTED].includes(game.status)) {
			return fail("You can not leave in this step!");
		}

		const player = await User.findById(id);
		if (!player) {
			return fail("invalid player!");
		}

		await TutorialGame.findByIdAndUpdate(gameId, {
			status: gameStatuses.CANCELED,
			canceledAt: moment(),
		});

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
	const game = await TutorialGame.findById(gameId);
	if (!game) {
		return fail("invalid game!");
	}

	if (game.result) {
		return success("ok", game.result);
	}

	const numberOfPlayers = game.players.length;

	const scoreboard = game.players
		.map((player) => {
			const questions = game.questions;
			const ownQuestionIndex = questions.findIndex((element) => {
				return element.user_id.toString() === player._id.toString();
			});

			const answersRates = [];
			const answersRatesRaw = [];
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				const questionWeight =
					1 +
					(question.rates.find(
						(r) => r.user_id.toString() === player._id.toString()
					)?.rate || 1) /
						100; // 1 => 1.01, 5 => 1.05

				const answer = question.answers.find(
					(elm) => elm.user_id.toString() === player._id.toString()
				);
				const sumRates =
					answer?.rates.reduce((n, { rate }) => n + rate, 0) || numberOfPlayers;
				answersRatesRaw.push(sumRates);
				answersRates.push(sumRates * questionWeight);
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

		return {
			questioner,
			question: questionObj.question,
			language: questionObj.language || env.defaultLanguage,
			rate: questionObj.rates.reduce((n, { rate }) => n + rate, 0),
			answers,
		};
	});

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

		rank++;
	}

	const result = { scoreboard, details };
	await TutorialGame.findByIdAndUpdate(gameId, {
		status: gameStatuses.ENDED,
		endedAt: moment(),
		result,
	});

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
