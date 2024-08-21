const Setting = require("../../models/Setting");
const { handleException } = require("../../helpers/utils");

exports.getSettings = async () => {
	try {
		const settings = await Setting.find();
		return success("settings retrieved successfully!", settings);
	} catch (e) {
		return handleException(e);
	}
};

exports.addSetting = async (params) => {
	try {
		if (!params.name || !params.key || !params.value) {
			return fail("invalid setting name, key or value!");
		}

		const setting = new Setting({
			name: params.name,
			key: params.key,
			value: params.value,
		});
		await setting.save();

		return success("Addedd successfully!", setting);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateSetting = async (params) => {
	try {
		if (!params.id || !params.value) {
			return fail("invalid setting id or value!");
		}

		const setting = await Setting.findOneAndUpdate(
			{ _id: params.id },
			{ value: params.value },
			{ new: true }
		);

		return success("Updated successfully!", setting);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteSetting = async (params) => {
	try {
		if (!params.id) {
			return fail("invalid setting id!");
		}

		await Setting.findOneAndDelete({ _id: params.id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
