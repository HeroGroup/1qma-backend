const AccountType = require("../../models/AccountType");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getAccountTypes = async () => {
	try {
		const accountTypes = await AccountType.find();

		return success("Account types retrieved successfully!", accountTypes);
	} catch (e) {
		return handleException(e);
	}
};

exports.addAccountType = async (params, icon) => {
	try {
		const { name, order } = params;
		if (!name) {
			return fail("Invalid account type name!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const accountType = new AccountType({
			name,
			icon: icon?.path || "",
			order: order || "",
			isActive: true,
		});
		await accountType.save();

		return success("Addedd successfully!", accountType);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateAccountType = async (params, icon) => {
	try {
		const { id, name, order, isActive } = params;
		if (!id || !name) {
			return fail("invalid account type id or name!");
		}

		let accountType = await AccountType.findById(id);

		if (icon && accountType.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${accountType.icon}`);
		}

		const iconPath = icon
			? icon.path.replace("public/", "")
			: accountType?.icon;

		accountType = await AccountType.findOneAndUpdate(
			{ _id: id },
			{ name, icon: iconPath, order, isActive },
			{ new: true }
		);

		return success("Updated successfully!", accountType);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteAccountType = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid account type id!");
		}

		const accountType = await AccountType.findById(id);

		if (accountType?.icon) {
			removeFile(`${__basedir}/public/${accountType.icon}`);
		}

		await AccountType.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
