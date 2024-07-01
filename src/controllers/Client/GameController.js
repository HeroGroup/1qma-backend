const { handleException } = require("../../helpers/utils");
const Category = require("../../models/Category");
const Setting = require("../../models/Setting");

exports.init = async () => {
	try {
		const createMode = [
			{ id: 0, text: "I'm ready" },
			{ id: 1, text: "Topic by me" },
			{ id: 2, text: "Players by me" },
			{ id: 3, text: "I'm in Full Control" },
		];

		const numberOfPlayers = await Setting.findOne({
			key: "NUMBER_OF_PLAYERS_PER_GAME",
		});

		const createGamePrice = await Setting.findOne({
			key: "CREATE_GAME_PRICE_BRONZE",
		});

		const categories = await Category.find();

		return success("initialize game parameters", {
			createMode,
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
		// creator id
		// game type (normal, survival)
		// create mode (gameTypes)
		// category or choose random categoory
		// questions
		// answers
		// send invite to players (random or selected by creator)
		// return game id;
	} catch (e) {
		return handleException(e);
	}
};

exports.joinGame = async (params) => {
	// player id
	// game id
	// question
	// answer
	try {
		//
	} catch (e) {
		return handleException(e);
	}
};
