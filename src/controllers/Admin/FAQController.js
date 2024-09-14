const FAQ = require("../../models/FAQ");
const { handleException } = require("../../helpers/utils");

exports.getFAQs = async () => {
	try {
		const FAQs = await FAQ.find();

		return success("FAQs retrieved successfully!", FAQs);
	} catch (e) {
		return handleException(e);
	}
};

exports.addFAQ = async (params) => {
	try {
		const { question, answer, order } = params;
		if (!question) {
			return fail("Invalid question!");
		}
		if (!answer) {
			return fail("Invalid answer!");
		}

		const faq = new FAQ({
			question,
			answer,
			order: order || 0,
			isActive: true,
		});
		await faq.save();

		return success("Addedd successfully!", faq);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateFAQ = async (params) => {
	try {
		const { id, question, answer, order, isActive } = params;
		if (!id || !question || !answer) {
			return fail("invalid parameters!");
		}

		const faq = await FAQ.findByIdAndUpdate(
			id,
			{ question, answer, order, isActive },
			{ new: true }
		);

		return success("Updated successfully!", faq);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteFAQ = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid id!");
		}

		await FAQ.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
