const AccountType = require("../models/AccountType");
const { handleException } = require("../helpers/utils");

exports.getAccountTypes = async () => {
	try {
		const accountTypes = await AccountType.find();
		return {
			status: 1,
			message: "Account types retrieved successfully!",
			data: accountTypes,
		};
	} catch (e) {
		return handleException(e);
	}
};

exports.addAccountType = async (params) => {
	try {
		if (!params.name) {
			return fail("Invalid account type name!");
		}

		const accountType = new AccountType({
			name: params.name,
		});
		await accountType.save();

		return success("Addedd successfully!", accountType);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateAccountType = async (params) => {
	try {
		if (!params.id || !params.name) {
			return fail("invalid account type id or name!");
		}

		const accountType = await AccountType.findOneAndUpdate(
			{ _id: params.id },
			{ name: params.name },
			{ new: true }
		);

		return success("Updated successfully!", accountType);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteAccountType = async (params) => {
	try {
		if (!params.id) {
			return fail("invalid account type id!");
		}

		await AccountType.deleteOne({ _id: params.id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
