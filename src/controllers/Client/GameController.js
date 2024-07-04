const { handleException, createGameCode } = require("../../helpers/utils");
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

exports.createGame = async (params) => {
	try {
		const { id, gameType, createMode, question, answer } = params;

		let { category, players } = params;

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

		switch (createMode) {
			case "3":
				// I'm in Full Control
				if (!category) {
					return fail("invalid category!");
				}
				if (!players || players.length < playersShouldCount - 1) {
					return fail("not enough players!");
				}
				if (players.length > playersShouldCount - 1) {
					return fail("too much players were selected!");
				}
				break;
			case "2":
				// Players by me
				if (!players || players.length < playersShouldCount - 1) {
					return fail("not enough players!");
				}
				if (players.length > playersShouldCount - 1) {
					return fail("too much players were selected!");
				}
				break;
			case "1":
				// Topic by me
				if (!category) {
					return fail("invalid category!");
				}
				break;
			default:
				// I'm ready
				break;
		}

		const categories = await Category.find({ isActive: true });
		if (!category) {
			// choose random category
			const random = Math.floor(Math.random() * categories.length);
			category = categories[random]._id;
		} else if (categories.find((element) => element._id === category)) {
			return fail("Invalid category!");
		}

		if (!players) {
			// implement a mechanism for all players to see and join this live game
		}

		const creator = await User.findById(id);
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
		const game = new Game({
			code: `G-${createGameCode()}`,
			creator: { _id: creator_id, firstName, lastName, email, profilePicture },
			createMode: createModes.find((element) => element.id === createMode),
			gameType: gameTypes.find((element) => element.id === gameType),
			category: categories.find((element) => element._id === category),
			players: [
				{ _id: creator_id, firstName, lastName, email, profilePicture },
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

		return success("Game was created successfully!", {
			gameId: game._id,
			gameCode: game.code,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.joinGame = async (params) => {
	try {
		const { id, gameId, gameCode, question, answer } = params;

		if (!id) {
			return fail("Invalid player id!");
		}

		if (!gameId && !gameCode) {
			return fail("Game id or code is required!");
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

		let game = gameId
			? await Game.findById(gameId)
			: await Game.findOne({ code: gameCode });
		if (!game) {
			return fail("invalid game!");
		}

		let gameStatus = game.status;
		if (gameStatus === "started") {
			return fail("Sorry, Game is already started!");
		} else if (gameStatus === "ended") {
			return fail("Sorry, Game has already ended!");
		}

		const {
			_id: player_id,
			firstName,
			lastName,
			email,
			profilePicture,
		} = player;

		const numberOfPlayersSetting = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});
		const currentPlayersCount = game.players.length;
		if (numberOfPlayersSetting.value === currentPlayersCount + 1) {
			gameStatus = "started";
		}

		game = await Game.findOneAndUpdate(
			{ _id: game.id },
			{
				$push: {
					players: { player_id, firstName, lastName, email, profilePicture },
				},
				$push: {
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

		// emit player added

		return success("You have successfully joined the game!", game);
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
			{ _id: 1, category: 1, creator: 1, players: 1, gameType: 1 }
		);
		const endedGames = await Game.find(
			{
				"creator._id": friend._id,
				status: "ended",
			},
			{ _id: 1, category: 1, creator: 1, players: 1, gameType: 1 }
		);

		return success("ok", { friend, liveGames, endedGames });
	} catch (e) {
		return handleException(e);
	}
};
