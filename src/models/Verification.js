const mongoose = require("mongoose");
const { Schema } = mongoose;

const verificationSchema = new Schema({
	type: String, // email, mobile
	target: String, // email address or mobile phone
	verificationCode: String,
	createdAt: Date,
	validUnitl: Date,
	isVerified: Boolean,
	verificationFor: mongoose.ObjectId, // user id
});

module.exports = mongoose.model("Verification", verificationSchema);
