const mongoose = require("mongoose");
const { Schema } = mongoose;

const survivalLeagueSchema = new Schema({
	title: String,
	titleFa: String,
	icon: String,
	startDate: Date,
	endDate: Date,
	totalScore: Number,
	totalGames: Number,
	isActive: Boolean,
});

module.exports = mongoose.model("SurvivalLeagues", survivalLeagueSchema);
