const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema({
	creator: Object,
	createMode: String,
	gameType: String,
	category: Object,
	players: Array,
	questions: Array,
	answers: Array,
});

module.exports = mongoose.model("Game", gameSchema);
