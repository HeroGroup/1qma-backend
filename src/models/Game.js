const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
	code: String,
	creator: Object,
	createMode: Object,
	gameType: Object,
	category: Object,
	inviteList: Array,
	players: Array,
	questions: [
		{
			user_id: mongoose.ObjectId,
			question: String,
			answers: [
				{
					user_id: mongoose.ObjectId,
					answer: String,
					rates: [{ user_id: mongoose.ObjectId, rate: Number }],
				},
			],
			rates: [{ user_id: mongoose.ObjectId, rate: Number }],
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
