const Transaction = require("../../models/Transaction");

exports.addCoinTransaction = async (
	type,
	title,
	coinAmount,
	user,
	newCoinBalance
) => {
	const transaction = new Transaction({
		type,
		title,
		coinAmount,
		user,
		newCoinBalance,
		createdAt: moment(),
	});

	await transaction.save();
};
