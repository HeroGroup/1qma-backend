const mongoose = require("mongoose");
const { Schema } = mongoose;

const registerQuestionSchema = new Schema({
	question: String,
	type: String,
	options: Array,
	placeholder: String,
	order: Number,
	isActive: Boolean,
});

module.exports = mongoose.model("RegisterQuestion", registerQuestionSchema);
