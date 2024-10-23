const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
	code: String,
	creator: Object,
	createMode: Object,
	gameType: Object,
	category: Object,
	inviteList: Array,
	numberOfPlayers: Number,
	players: Array,
	questions: [
		{
			user_id: mongoose.ObjectId,
			question: String,
			language: String,
			answers: [
				{
					user_id: mongoose.ObjectId,
					answer: String,
					isEditing: Boolean,
					language: String,
					rates: [{ user_id: mongoose.ObjectId, rate: Number }],
				},
			],
			rates: [{ user_id: mongoose.ObjectId, rate: Number }],
			passed: Boolean,
		},
	],
	status: String,
	createdAt: Date,
	startedAt: Date,
	endedAt: Date,
	canceledAt: Date,
	result: Object,
});

module.exports = mongoose.model("Game", gameSchema);
