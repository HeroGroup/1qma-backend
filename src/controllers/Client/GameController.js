const { handleException } = require("../../helpers/utils");
const Setting = require("../../models/Setting");

exports.init = async () => {
	try {
		const gameTypes = [
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

		return success("initialize game parameters", {
			gameTypes,
			numberOfPlayers: numberOfPlayers?.value || 5,
			gamePrice: { coin: "bronze", count: createGamePrice?.value || 2 },
		});
	} catch (e) {
		return handleException(e);
	}
};
