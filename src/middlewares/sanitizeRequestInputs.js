const { sanitize } = require("../validator");

exports.sanitizeRequestInputs = (req, res, next) => {
	// sanitize inputs
	const { body: params } = req;
	const paramNames = Object.keys(params);
	paramNames.forEach((elm) => {
		req.body[elm] = sanitize(params[elm]);
	});

	next();
};
