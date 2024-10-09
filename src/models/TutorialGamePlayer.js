const mongoose = require("mongoose");
const { Schema } = mongoose;

const tutorialGamePlayerSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	profilePicture: String,
});

module.exports = mongoose.model("TutorialGamePlayer", tutorialGamePlayerSchema);
