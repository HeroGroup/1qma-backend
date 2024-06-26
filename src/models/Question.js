const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
	category: Object,
	question: String,
	answer: String,
	user: Object,
});

module.exports = mongoose.model("Question", questionSchema);
