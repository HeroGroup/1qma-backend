const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountTypeSchema = new Schema({
	name: String,
	icon: String,
	order: String,
	isActive: false,
});

module.exports = mongoose.model("AccountType", accountTypeSchema);
