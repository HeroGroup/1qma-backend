const ShopItem = require("../../models/ShopItem");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getShopItems = async () => {
	try {
		const shopItems = await ShopItem.find();

		return success("ok", shopItems);
	} catch (e) {
		return handleException(e);
	}
};

exports.addShopItem = async (params, icon) => {
	try {
		const { type, details, realPrice, coinPrice } = params;
		if (!params.type || !params.details) {
			return fail("invalid parameters!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const shopItem = new ShopItem({
			type,
			details,
			icon: icon?.path || "",
			realPrice,
			currency: env.defaultCurrency,
			coinPrice,
			isActive: true,
		});
		await shopItem.save();

		return success("Shop item was added successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.updateShopItem = async (params, icon) => {
	try {
		const { id, type, details, realPrice, coinPrice, isActive } = params;
		if (!params.id) {
			return fail("invalid shop item id!");
		}

		let shopItem = await ShopItem.findById(id);

		if (icon && shopItem.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${shopItem.icon}`);
		}

		const iconPath = icon ? icon.path.replace("public/", "") : shopItem?.icon;

		shopItem = await ShopItem.findByIdAndUpdate(
			id,
			{ type, details, icon: iconPath, realPrice, coinPrice, isActive },
			{ new: true }
		);

		return success("Updated successfully!", shopItem);
	} catch (e) {
		return handleException(e);
	}
};

exports.toggleActiveShopItem = async (params) => {
	try {
		const { id, isActive } = params;
		if (!params.id) {
			return fail("invalid shop item id!");
		}

		await ShopItem.findByIdAndUpdate(id, { isActive });

		return success("Updated successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteShopItem = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid shop item id!");
		}

		const shopItem = await ShopItem.findById(id);

		if (shopItem?.icon) {
			removeFile(`${__basedir}/public/${shopItem.icon}`);
		}

		await ShopItem.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
