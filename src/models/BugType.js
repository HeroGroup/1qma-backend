const mongoose = require("mongoose");
const { Schema } = mongoose;

const bugTypeSchema = new Schema({
	category: String,
	subCategories: [{ title: String }],
	icon: String,
	order: Number,
	isActive: Boolean,
});

module.exports = mongoose.model("BugType", bugTypeSchema);
