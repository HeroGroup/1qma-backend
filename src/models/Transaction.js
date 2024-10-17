const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
	type: String,
	title: String,
	amount: Number,
	currency: String, // default: $
	coinAmount: Object,
	user: mongoose.ObjectId,
	newCoinBalance: Object,
	createdAt: Date,
});

module.exports = mongoose.model("Transaction", transactionSchema);
