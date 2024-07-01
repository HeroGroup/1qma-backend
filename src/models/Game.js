const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
	creator: Object,
	createMode: String,
	gameType: String,
	category: Object,
	players: Array,
	questions: Array,
	status: String,
});

module.exports = mongoose.model("Game", gameSchema);
