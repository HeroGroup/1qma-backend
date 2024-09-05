const mongoose = require("mongoose");
const { Schema } = mongoose;

const bugReportSchema = new Schema({
	category: Object,
	subCategory: Object,
	description: String,
	user: Object,
});

module.exports = mongoose.model("BugReport", bugReportSchema);
