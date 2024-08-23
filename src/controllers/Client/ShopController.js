const { shopItemTypes } = require("../../helpers/constants");
const { handleException, objectId } = require("../../helpers/utils");
const ShopItem = require("../../models/ShopItem");

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

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
