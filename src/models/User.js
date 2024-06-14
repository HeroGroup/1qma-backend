const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: String,
	lastName: String,
	anonymousName: String,
	email: String,
	mobile: String,
	emailVerified: Boolean,
	mobileVerified: Boolean,
	password: String,
	isActive: Boolean,
	userType: String,
	hasCompletedSignup: Boolean,
	created_at: Date,
	referCode: String,
	referer: Object,
	inWaitList: Boolean,
	gender: String,
	education: String,
	country: String,
	city: String,
	preferedCategories: Array,
	accountType: Object,
	preferedLanguage: String,
	defaultHomePage: String,
	profilePicture: String,
	assets: Array,
	maxInvites: String,
	invitations: Array,
});

module.exports = mongoose.model("User", userSchema);
