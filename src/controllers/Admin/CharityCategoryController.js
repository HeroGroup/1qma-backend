const CharityCategory = require("../../models/CharityCategory");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getCharityCategories = async () => {
	try {
		const charityCategories = await CharityCategory.find();

		return success("categories retrieved successfully!", charityCategories);
	} catch (e) {
		return handleException(e);
	}
};

exports.addCharityCategory = async (params, icon) => {
	try {
		const { title, activities, order } = params;
		if (!title) {
			return fail("invalid charity category title!");
		}
		if (!activities || activities.length === 0) {
			return fail("invalid charity category activities!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const charityCategory = new CharityCategory({
			title,
			activities,
			icon: icon?.path || "",
			order: order || 0,
			isActive: true,
		});
		await charityCategory.save();

		return success("Addedd successfully!", charityCategory);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateCharityCategory = async (params, icon) => {
	try {
		const { id, title, activities, order, isActive } = params;
		if (!id || !title || !activities || activities.length === 0) {
			return fail("invalid parameters!");
		}

		let charityCategory = await CharityCategory.findById(id);

		if (icon && charityCategory.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${charityCategory.icon}`);
		}

		const iconPath = icon
			? icon.path.replace("public/", "")
			: charityCategory?.icon;

		charityCategory = await CharityCategory.findOneAndUpdate(
			{ _id: id },
			{ title, activities, icon: iconPath, order, isActive },
			{ new: true }
		);

		return success("Updated successfully!", charityCategory);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteCharityCategory = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid charity category id!");
		}

		let charityCategory = await CharityCategory.findById(id);

		if (charityCategory?.icon) {
			removeFile(`${__basedir}/public/${charityCategory.icon}`);
		}

		await CharityCategory.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};