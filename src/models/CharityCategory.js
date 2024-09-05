const mongoose = require("mongoose");
const { Schema } = mongoose;

const charityCategorySchema = new Schema({
	title: String,
	activities: [{ title: String }],
	icon: String,
	order: Number,
	isActive: Boolean,
});

module.exports = mongoose.model("CharityCategory", charityCategorySchema);
