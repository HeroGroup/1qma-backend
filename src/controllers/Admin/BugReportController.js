const BugReport = require("../../models/BugReport");
const { handleException } = require("../../helpers/utils");

exports.getBugReports = async (params) => {
	try {
		const page = params.page || 1;
		const limit = params.limit || 10;

		const bugReports = await BugReport.find()
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", bugReports);
	} catch (e) {
		return handleException(e);
	}
};
