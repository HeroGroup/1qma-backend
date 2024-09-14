const mongoose = require("mongoose");
const { Schema } = mongoose;

const survivalLeagueSchema = new Schema({
	title: String,
	icon: String,
	startDate: Date,
	endDate: Date,
	totalScore: Number,
	totalGames: Number,
});

module.exports = mongoose.model("SurvivalLeagues", survivalLeagueSchema);
