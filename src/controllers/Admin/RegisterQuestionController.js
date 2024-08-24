const RegisterQuestion = require("../../models/RegisterQuestion");
const { handleException, objectId } = require("../../helpers/utils");

exports.listQuestions = async () => {
	try {
		const questions = await RegisterQuestion.find();

		return success("ok", questions);
	} catch (e) {
		return handleException(e);
	}
};

exports.addQuestion = async (params) => {
	try {
		const { question, type, options, placeholder } = params;
		if (!params.question || !params.type) {
			return fail("invalid parameters!");
		}

		const registerQuestion = new RegisterQuestion({
			question,
			type,
			options,
			placeholder,
			isActive: true,
		});
		await registerQuestion.save();

		return success("Question was added successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.updateQuestion = async (params) => {
	try {
		const { id, question, type, options, placeholder, isActive } = params;
		if (!params.id) {
			return fail("invalid question id!");
		}

		const registerQuestion = await RegisterQuestion.findByIdAndUpdate(
			id,
			{ question, type, options, placeholder, isActive },
			{ new: true }
		);

		return success("Updated successfully!", registerQuestion);
	} catch (e) {
		return handleException(e);
	}
};

exports.toggleActiveQuestion = async (params) => {
	try {
		const { id, isActive } = params;
		if (!params.id) {
			return fail("invalid question id!");
		}

		await RegisterQuestion.findByIdAndUpdate(id, { isActive });

		return success("Updated successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteQuestion = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid question id!");
		}

		await RegisterQuestion.deleteOne({ _id: objectId(id) });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
