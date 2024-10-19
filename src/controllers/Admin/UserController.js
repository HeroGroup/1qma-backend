const User = require("../../models/User");
const { coinTypes, transactionTypes } = require("../../helpers/constants");
const { handleException } = require("../../helpers/utils");
const { addCoinTransaction } = require("../Client/TransactionController");

exports.getUsers = async () => {
	try {
		const users = await User.find();
		return success("users retrieved successfully!", { users, coinTypes });
	} catch (e) {
		return handleException(e);
	}
};

exports.toggleActive = async (params) => {
	try {
		const user = await User.findOneAndUpdate(
			{ _id: params.id },
			{
				isActive: params.active,
			},
			{
				new: true,
			}
		);
		return success("users updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.addInvitations = async (params) => {
	try {
		const { id, numberOfInvitations, mass } = params;

		if (!numberOfInvitations) {
			return fail("invalid numberOfInvitations");
		}

		if (id) {
			await User.findByIdAndUpdate(id, {
				$inc: { maxInvites: parseInt(numberOfInvitations) },
			});
		} else if (mass) {
			await User.updateMany(
				{},
				{
					$inc: { maxInvites: parseInt(numberOfInvitations) },
				}
			);
		}

		return await this.getUsers();
	} catch (e) {
		return handleException(e);
	}
};

exports.addCoins = async (params) => {
	try {
		const { id, coinType, numberOfCoins, mass } = params;

		if (!coinType || !numberOfCoins) {
			return fail("invalid input parameters!");
		}

		if (id) {
			const user = await User.findById(id);
			if (!user) {
				return fail("invalid user!");
			}

			const userCoins = user.assets.coins;
			userCoins[coinType] += parseInt(numberOfCoins);
			await User.findByIdAndUpdate(id, {
				"assets.coins": userCoins,
			});

			await addCoinTransaction(
				transactionTypes.INCREASE,
				"Increase by Admin",
				{ price: numberOfCoins, coin: coinType },
				id,
				userCoins
			);
		} else if (mass) {
			//
		}

		return await this.getUsers();
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteUser = async (params) => {
	try {
		// if (params.which && params.which == "all") {
		// 	const res = await User.deleteMany({
		// 		userType: { $ne: "admin" },
		// 	});

		// 	const res2 = await Verification.deleteMany();

		// 	return success(
		// 		`${res.deletedCount} users and ${res2.deletedCount} verifications were removed successfully!`
		// 	);
		// }

		if (!params.id) {
			return fail("invalid user id");
		}

		const res = await User.deleteOne({
			_id: params.id,
			userType: { $ne: "admin" },
		});

		if (res.deletedCount === 0) {
			return fail("Invali user!");
		}

		return success("user removed successfully!");
	} catch (e) {
		return handleException(e);
	}
};
