const Transaction = require("../../models/Transaction");

exports.addCoinTransaction = async (type, title, coinAmount, user) => {
	const transaction = new Transaction({
		type,
		title,
		coinAmount,
		user,
		createdAt: moment(),
	});

	await transaction.save();
};
