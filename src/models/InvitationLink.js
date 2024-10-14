const mongoose = require("mongoose");
const { Schema } = mongoose;

const invitationLinkSchema = new Schema({
	referCode: String,
	invitedEmail: String,
	createdAt: Date,
	isActive: Boolean,
});

module.exports = mongoose.model("InvitationLink", invitationLinkSchema);
