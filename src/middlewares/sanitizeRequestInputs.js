const { sanitize } = require("../helpers/validator");

exports.sanitizeRequestInputs = (req, res, next) => {
	// sanitize inputs
	const {
		body: bodyParameters,
		params: paramsParameters,
		query: queryParameters,
	} = req;

	// req.body
	const bodyNames = Object.keys(bodyParameters);
	bodyNames.forEach((elm) => {
		req.body[elm] = sanitize(bodyParameters[elm]);
	});

	// req.params
	const paramsNames = Object.keys(bodyParameters);
	paramsNames.forEach((elm) => {
		req.params[elm] = sanitize(bodyParameters[elm]);
	});

	// req.query
	const queryNames = Object.keys(bodyParameters);
	queryNames.forEach((elm) => {
		req.query[elm] = sanitize(bodyParameters[elm]);
	});

	next();
};
