const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountTypeSchema = new Schema({
	name: String,
	icon: String,
});

module.exports = mongoose.model("AccountType", accountTypeSchema);
