const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	isActive: Boolean,
});

module.exports = mongoose.model("User", userSchema);
