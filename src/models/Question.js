const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
	category: Object,
	question: String,
	answer: String,
	user: Object,
	bookmarks: Array,
	likes: Number,
	dislikes: Number,
	score: Number,
	plays: Number,
	answers: Number,
	rates: Number,
	avgRate: Number,
	createdAt: Date,
});

module.exports = mongoose.model("Question", questionSchema);
