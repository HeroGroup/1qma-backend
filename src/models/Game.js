const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
	code: String,
	creator: Object,
	createMode: Object,
	gameType: Object,
	category: Object,
	players: Array,
	questions: Array,
	status: String,
	createdAt: Date,
});

module.exports = mongoose.model("Game", gameSchema);
