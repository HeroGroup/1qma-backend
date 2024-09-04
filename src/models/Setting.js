const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema({
	name: String,
	key: String,
	value: String,
	type: String,
});

module.exports = mongoose.model("Setting", settingSchema);
