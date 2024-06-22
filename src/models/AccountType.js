const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountTypeSchema = new Schema({
	name: String,
	icon: String,
	order: String,
	isActive: Boolean,
});

module.exports = mongoose.model("AccountType", accountTypeSchema);
