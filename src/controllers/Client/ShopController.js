const { shopItemTypes } = require("../../helpers/constants");
const { handleException, objectId } = require("../../helpers/utils");
const ShopItem = require("../../models/ShopItem");
const Transaction = require("../../models/Transaction");
const User = require("../../models/User");

exports.getShopItems = async (params) => {
	try {
		const type = params.type;
		const page = params.page || 1;
		const limit = params.limit || 5;

		const shopItems = type
			? await ShopItem.find({ type })
					.skip((page - 1) * limit)
					.limit(limit)
			: await ShopItem.find();

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
		const user = await User.findById(id);
		const shopItemCoinType = shopItem.coinPrice.coin;
		const shopItemCoinPrice = shopItem.coinPrice.price;
		const userAsset = user.assets.coins[shopItemCoinType];

		if (parseInt(userAsset) < parseInt(shopItemCoinPrice)) {
			return fail(
				"Unfortunately you do not have enough coins for this transaction!"
			);
		}

		const userAssets = user.assets.coins;
		userAssets[shopItemCoinType] =
			userAssets[shopItemCoinType] - shopItemCoinPrice;
		await User.findByIdAndUpdate(id, { "assets.coins": userAssets });

		let title = "shop ";
		for (detail of shopItem.details) {
			title += `${detail.count} ${detail.title} `;
		}
		title += "with coin credit.";
		const transaction = new Transaction({
			type: "buy",
			title,
			coinAmount: shopItem.coinPrice,
			user: user._id,
			createdAt: moment(),
		});

		await transaction.save();

		return success("Successful payment!");
	} catch (e) {
		return handleException(e);
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
