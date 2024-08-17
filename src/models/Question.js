const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
	category: Object,
	language: String,
	question: String,
	answer: String,
	user: Object,
	bookmarks: Array,
	likes: Array,
	dislikes: Array,
	score: Number,
	plays: Number,
	answers: Number,
	rates: Number,
	avgRate: Number,
	createdAt: Date,
});

module.exports = mongoose.model("Question", questionSchema);
