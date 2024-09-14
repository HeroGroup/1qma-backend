const FAQ = require("../../models/FAQ");
const Setting = require("../../models/Setting");
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

exports.getTerms = async () => {
	try {
		const terms = await Setting.findOne({ key: "TERMS_OF_SERVICE" });

		return success("ok", terms);
	} catch (e) {
		return handleException(e);
	}
};

exports.getPrivacyPolicies = async () => {
	try {
		const privacyPolicies = await Setting.findOne({ key: "PRIVACY_POLICIES" });

		return success("ok", privacyPolicies);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateTermsOfService = async (params) => {
	try {
		const terms = await Setting.findOneAndUpdate(
			{ key: "TERMS_OF_SERVICE" },
			{ value: params.terms, name: "Terms of Service" },
			{ upsert: true, new: true }
		);

		return success("Updated Successfully!", terms);
	} catch (e) {
		return handleException(e);
	}
};

exports.updatePrivacyPolicies = async (params) => {
	try {
		const terms = await Setting.findOneAndUpdate(
			{ key: "PRIVACY_POLICIES" },
			{ value: params.privacyPolicies, name: "Privacy Policies" },
			{ upsert: true, new: true }
		);

		return success("Updated Successfully!", terms);
	} catch (e) {
		return handleException(e);
	}
};
