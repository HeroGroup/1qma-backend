const moment = require("moment");
const { handleException } = require("../../helpers/utils");
const User = require("../../models/User");

exports.renewBasicAccounts = async (token) => {
	try {
		if (token !== env.renewAccountsToken) {
			return fail("invalid token!");
		}

		const now = moment(new Date());

		const users = await User.find({
			"accountType.startDate": { $exists: true },
			"accountType.expireDays": { $exists: true },
		});

		const filteredUsers = users.filter(
			(user) =>
				moment(user.accountType.startDate)
					.add(user.accountType.expireDays, "days")
					.diff(now, "days", true) < 1
		);

		const filteredUsersIds = [];
		for (const user of filteredUsers) {
			filteredUsersIds.push(user._id);
		}

		await User.updateMany(
			{ _id: { $in: filteredUsersIds } },
			{ $inc: { "accountType.expireDays": 30 } }
		);

		return success(`${filteredUsers.length} accounts updated successfully!`);
	} catch (e) {
		return handleException(e);
	}
};

exports.cancelAbandonedGames = async (token) => {};
