const BugType = require("../../models/BugType");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getBugTypes = async () => {
	try {
		const bugTypes = await BugType.find();

		return success("Bug types retrieved successfully!", bugTypes);
	} catch (e) {
		return handleException(e);
	}
};

exports.addBugType = async (params, icon) => {
	try {
		const { category, subCategories, order } = params;
		if (!category) {
			return fail("Invalid bug type category!");
		}
		if (!subCategories || subCategories.length === 0) {
			return fail("Invalid bug type sub categories!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const bugType = new BugType({
			category,
			subCategories,
			icon: icon?.path || "",
			order: order || 0,
			isActive: true,
		});
		await bugType.save();

		return success("Addedd successfully!", bugType);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateBugType = async (params, icon) => {
	try {
		const { id, category, subCategories, order, isActive } = params;
		if (!id || !category || !subCategories || subCategories.length === 0) {
			return fail("invalid parameters!");
		}

		let bugType = await BugType.findById(id);

		if (icon && bugType.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${bugType.icon}`);
		}

		const iconPath = icon ? icon.path.replace("public/", "") : bugType?.icon;

		bugType = await BugType.findOneAndUpdate(
			{ _id: id },
			{ category, subCategories, icon: iconPath, order, isActive },
			{ new: true }
		);

		return success("Updated successfully!", bugType);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteBugType = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid bug type id!");
		}

		const bugType = await BugType.findById(id);

		if (bugType?.icon) {
			removeFile(`${__basedir}/public/${bugType.icon}`);
		}

		await BugType.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
