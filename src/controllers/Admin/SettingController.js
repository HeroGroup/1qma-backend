const Setting = require("../../models/Setting");
const { handleException } = require("../../helpers/utils");
const { settingsTypes } = require("../../helpers/constants");

exports.getSettings = async () => {
	try {
		const allSettings = await Setting.find();

		const settings = [];
		for (const settingsType of settingsTypes) {
			settings.push({
				title: settingsType,
				setting: allSettings.filter((setting) => setting.type === settingsType),
			});
		}

		return success("settings retrieved successfully!", {
			settingsTypes,
			settings,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.addSetting = async (params) => {
	try {
		if (!params.name || !params.key || !params.value || !params.type) {
			return fail("invalid setting name, key or value!");
		}

		const setting = new Setting({
			name: params.name,
			key: params.key,
			value: params.value,
			type: params.type,
		});
		await setting.save();

		return success("Addedd successfully!", setting);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateSetting = async (params) => {
	try {
		if (!params.id || !params.value || !params.type) {
			return fail("invalid parameters!");
		}

		const setting = await Setting.findOneAndUpdate(
			{ _id: params.id },
			{ value: params.value, type: params.type },
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
