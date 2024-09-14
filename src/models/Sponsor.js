const mongoose = require("mongoose");
const { Schema } = mongoose;

const sponsorSchema = new Schema({
	name: String,
	icon: String,
	link: String,
	createdAt: Date,
	isActive: Boolean,
});

module.exports = mongoose.model("Sponsor", sponsorSchema);
