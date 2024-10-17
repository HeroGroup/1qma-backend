const { shopItemTypes, transactionTypes } = require("../../helpers/constants");
const { handleException, objectId } = require("../../helpers/utils");
const ShopItem = require("../../models/ShopItem");
const User = require("../../models/User");
const { addCoinTransaction } = require("./TransactionController");

exports.getShopItems = async (params) => {
	try {
		const type = params.type;
		const page = params.page || 1;
		const limit = params.limit || 5;

		const shopItems = type
			? await ShopItem.find({ type, isActive: true })
					.skip((page - 1) * limit)
					.limit(limit)
			: await ShopItem.find({ isActive: true });

		const res = type ? shopItems : [];
		if (!type) {
			for (const shopItemType of shopItemTypes) {
				res.push({
					shopItemType,
					items: shopItems
						.filter((shopItem) => shopItem.type === shopItemType)
						.slice(0, limit - 1),
				});
			}
		}

		return success("ok", res);
	} catch (e) {
		return handleException(e);
	}
};

exports.shopWithCoin = async (params) => {
	try {
		const { id, shopItemId } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		if (!shopItemId) {
			return fail("invalid shop item id!");
		}

		const shopItem = await ShopItem.findById(shopItemId);
		if (!shopItem) {
			return fail("invalid shop item!");
		}

		// control user balance
		let user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		const shopItemCoinType = shopItem.coinPrice.coin;
		const shopItemCoinPrice = shopItem.coinPrice.price;
		const userAsset = user.assets.coins[shopItemCoinType] || 0;

		if (parseInt(userAsset) < parseInt(shopItemCoinPrice)) {
			return fail(
				"Unfortunately you do not have enough coins for this transaction!"
			);
		}

		const userAssets = user.assets.coins;
		userAssets[shopItemCoinType] =
			userAssets[shopItemCoinType] - shopItemCoinPrice;
		user = await User.findByIdAndUpdate(
			id,
			{ "assets.coins": userAssets },
			{ new: true }
		);

		let title = "shop ";
		for (detail of shopItem.details) {
			title += `${detail.count} ${detail.title} `;
		}
		title += "with coin credit.";

		await addCoinTransaction(
			transactionTypes.DECREASE,
			title,
			shopItem.coinPrice,
			user._id,
			user.assets.coins
		);

		// assign shop items to user
		await assignItemsToUser(id, shopItem.details);

		return success("Successful payment!", { newBalance: user.assets.coins });
	} catch (e) {
		return handleException(e);
	}
};

const assignItemsToUser = async (userId, details) => {
	for (const item of details) {
		const { title, count } = item;

		if (
			["invitation", "Invitation", "invitations", "Invitations"].includes(title)
		) {
			await User.findByIdAndUpdate(userId, {
				$inc: { maxInvites: count },
			});
		} else {
			const user = await User.findById(userId);
			const userCoins = user.assets.coins;
			userCoins[title] = userCoins[title] + count;
			await User.findByIdAndUpdate(userId, {
				"assets.coins": userCoins,
			});
			await addCoinTransaction(
				transactionTypes.INCREASE,
				title,
				{ price: count, coin: title },
				userId,
				userCoins
			);
		}
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
