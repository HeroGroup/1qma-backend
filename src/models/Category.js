const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
	name: String,
	icon: String,
});

module.exports = mongoose.model("Category", categorySchema);
