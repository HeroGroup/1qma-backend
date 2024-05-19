const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	mobile: String,
	emailVerified: Boolean,
	mobileVerified: Boolean,
	password: String,
	isActive: Boolean,
	hasCompletedSignup: Boolean,
	created_at: Date,
	referCode: String,
	referer: mongoose.ObjectId,
	inWaitList: Boolean,
	gender: String,
	education: String,
	country: String,
	city: String,
	preferedCategories: Array,
	accountType: String,
});

module.exports = mongoose.model("User", userSchema);
