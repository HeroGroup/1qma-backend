const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
	title: String,
	message: String,
	data: Object,
	createdAt: Date,
	hasSeen: Boolean,
	user: mongoose.ObjectId,
});

module.exports = mongoose.model("Notification", notificationSchema);
