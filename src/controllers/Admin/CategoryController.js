const Category = require("../../models/Category");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getCategories = async () => {
	try {
		const categories = await Category.find();
		return {
			status: 1,
			message: "categories retrieved successfully!",
			data: categories,
		};
	} catch (e) {
		return handleException(e);
	}
};

exports.addCategory = async (params, icon) => {
	try {
		const { name } = params;
		if (!name) {
			return fail("invalid category name!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const category = new Category({
			name,
			icon: icon.path || "",
		});
		await category.save();

		return success("Addedd successfully!", category);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateCategory = async (params, icon) => {
	try {
		const { id, name } = params;
		if (!id || !name) {
			return fail("invalid category id or name!");
		}

		let category = await Category.findById(id);

		if (icon && category.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${category.icon}`);
		}

		icon.path = icon ? icon.path.replace("public/", "") : category?.icon;

		category = await Category.findOneAndUpdate(
			{ _id: id },
			{ name, icon: icon.path },
			{ new: true }
		);

		return success("Updated successfully!", category);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteCategory = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid category id!");
		}

		let category = await Category.findById(id);

		if (category?.icon) {
			removeFile(`${__basedir}/public/${category.icon}`);
		}

		await Category.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
