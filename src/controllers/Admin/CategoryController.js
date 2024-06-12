const Category = require("../../models/Category");
const { handleException } = require("../../helpers/utils");

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

exports.addCategory = async (params) => {
	try {
		if (!params.name) {
			return fail("invalid category name!");
		}

		const category = new Category({
			name: params.name,
		});
		await category.save();

		return success("Addedd successfully!", category);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateCategory = async (params) => {
	try {
		if (!params.id || !params.name) {
			return fail("invalid category id or name!");
		}

		const category = await Category.findOneAndUpdate(
			{ _id: params.id },
			{ name: params.name },
			{ new: true }
		);

		return success("Updated successfully!", category);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteCategory = async (params) => {
	try {
		if (!params.id) {
			return fail("invalid category id!");
		}

		await Category.deleteOne({ _id: params.id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
