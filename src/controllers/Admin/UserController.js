const User = require("../../models/User");
const { coinTypes, transactionTypes } = require("../../helpers/constants");
const { handleException } = require("../../helpers/utils");
const { addCoinTransaction } = require("../Client/TransactionController");

exports.getUsers = async () => {
	try {
		const users = await User.find();
		return success("users retrieved successfully!", {
			users,
			coinTypes,
			transactionTypes,
		});
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
		const { id, numberOfInvitations, type, mass } = params;

		if (!numberOfInvitations || numberOfInvitations < 1) {
			return fail("invalid numberOfInvitations");
		}

		let inc = 0;
		switch (type) {
			case transactionTypes.INCREASE:
				inc = parseInt(numberOfInvitations);
				break;
			case transactionTypes.DECREASE:
				inc = -parseInt(numberOfInvitations);
				break;
			default:
				break;
		}

		if (id) {
			await User.findByIdAndUpdate(id, {
				$inc: { maxInvites: inc },
			});
		} else if (mass) {
			await User.updateMany(
				{},
				{
					$inc: { maxInvites: inc },
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
		const { id, coinType, numberOfCoins, type, mass } = params;

		if (!coinType || !numberOfCoins || numberOfCoins < 1) {
			return fail("invalid input parameters!");
		}

		let inc = 0;
		switch (type) {
			case transactionTypes.INCREASE:
				inc = parseInt(numberOfCoins);
				break;
			case transactionTypes.DECREASE:
				inc = -parseInt(numberOfCoins);
				break;
			default:
				break;
		}

		if (id) {
			const user = await User.findById(id);
			if (!user) {
				return fail("invalid user!");
			}

			const userCoins = user.assets.coins;
			userCoins[coinType] += inc;
			await User.findByIdAndUpdate(id, {
				"assets.coins": userCoins,
			});

			await addCoinTransaction(
				type,
				"Updated by Admin",
				{ price: inc, coin: coinType },
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
