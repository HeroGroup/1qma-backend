const { sanitizeInputExceptions } = require("../helpers/constants");
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
		if (!sanitizeInputExceptions.includes(elm)) {
			console.log(elm);
			req.body[elm] = sanitize(bodyParameters[elm]);
		}
	});

	// req.params
	const paramsNames = Object.keys(paramsParameters);
	paramsNames.forEach((elm) => {
		if (!sanitizeInputExceptions.includes(elm)) {
			req.params[elm] = sanitize(paramsParameters[elm]);
		}
	});

	// req.query
	const queryNames = Object.keys(queryParameters);
	queryNames.forEach((elm) => {
		if (!sanitizeInputExceptions.includes(elm)) {
			req.query[elm] = sanitize(queryParameters[elm]);
		}
	});

	next();
};
