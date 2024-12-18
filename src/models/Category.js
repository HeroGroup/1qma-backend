const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
	name: String,
	nameFa: String,
	icon: String,
	order: String,
	isActive: Boolean,
});

module.exports = mongoose.model("Category", categorySchema);
