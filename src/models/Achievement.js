const mongoose = require("mongoose");
const { Schema } = mongoose;

const achievementSchema = new Schema({
	condition: Object,
	reward: Object,
	showModal: Boolean,
	description: String,
	descriptionFa: String,
	icon: String,
	link: String,
	isActive: Boolean,
});

module.exports = mongoose.model("Achievement", achievementSchema);
