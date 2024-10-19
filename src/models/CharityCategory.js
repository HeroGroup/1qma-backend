const mongoose = require("mongoose");
const { Schema } = mongoose;

const charityCategorySchema = new Schema({
	title: String,
	activities: [
		{
			title: String,
			neededFund: Number,
			currency: String,
			progress: Number,
			isDefault: Boolean,
		},
	],
	icon: String,
	order: Number,
	isActive: Boolean,
	isDefault: Boolean,
});

module.exports = mongoose.model("CharityCategory", charityCategorySchema);
