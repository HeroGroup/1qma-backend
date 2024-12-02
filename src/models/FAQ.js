const mongoose = require("mongoose");
const { Schema } = mongoose;

const faqSchema = new Schema({
	question: String,
	questionFa: String,
	answer: String,
	answerFa: String,
	order: Number,
	isActive: Boolean,
});

module.exports = mongoose.model("FAQ", faqSchema);
