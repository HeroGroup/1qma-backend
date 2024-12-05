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
		const { question, questionFa, answer, answerFa, order } = params;
		if (!question || !questionFa) {
			return fail("Invalid question!");
		}
		if (!answer || !answerFa) {
			return fail("Invalid answer!");
		}

		const faq = new FAQ({
			question,
			questionFa,
			answer,
			answerFa,
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
		const { id, question, questionFa, answer, answerFa, order, isActive } =
			params;
		if (!id || !question || !questionFa || !answer || !answerFa) {
			return fail("invalid parameters!");
		}

		const faq = await FAQ.findByIdAndUpdate(
			id,
			{ question, questionFa, answer, answerFa, order, isActive },
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
		const termsFa = await Setting.findOne({ key: "TERMS_OF_SERVICE_FA" });

		return success("ok", { terms, termsFa });
	} catch (e) {
		return handleException(e);
	}
};

exports.getPrivacyPolicies = async () => {
	try {
		const privacyPolicies = await Setting.findOne({ key: "PRIVACY_POLICIES" });
		const privacyPoliciesFa = await Setting.findOne({
			key: "PRIVACY_POLICIES_FA",
		});

		return success("ok", { privacyPolicies, privacyPoliciesFa });
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

		const termsFa = await Setting.findOneAndUpdate(
			{ key: "TERMS_OF_SERVICE_FA" },
			{ value: params.termsFa, name: "Terms of Service Fa" },
			{ upsert: true, new: true }
		);
		return success("Updated Successfully!", { terms, termsFa });
	} catch (e) {
		return handleException(e);
	}
};

exports.updatePrivacyPolicies = async (params) => {
	try {
		const privacyPolicies = await Setting.findOneAndUpdate(
			{ key: "PRIVACY_POLICIES" },
			{ value: params.privacyPolicies, name: "Privacy Policies" },
			{ upsert: true, new: true }
		);

		const privacyPoliciesFa = await Setting.findOneAndUpdate(
			{ key: "PRIVACY_POLICIES_FA" },
			{ value: params.privacyPoliciesFa, name: "Privacy Policies Fa" },
			{ upsert: true, new: true }
		);
		return success("Updated Successfully!", {
			privacyPolicies,
			privacyPoliciesFa,
		});
	} catch (e) {
		return handleException(e);
	}
};
