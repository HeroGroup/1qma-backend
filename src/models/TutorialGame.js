const mongoose = require("mongoose");
const { Schema } = mongoose;

const tutorialGameSchema = new Schema({
	code: String,
	creator: Object,
	category: Object,
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
		},
	],
	status: String,
	createdAt: Date,
	startedAt: Date,
	endedAt: Date,
	canceledAt: Date,
	result: Object,
});

module.exports = mongoose.model("TutorialGame", tutorialGameSchema);