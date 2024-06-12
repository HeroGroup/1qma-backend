const sanitizeHtml = require("sanitize-html");

exports.sanitize = (input) => {
	const inputType = typeof input;
	switch (inputType) {
		case "string":
			return sanitizeHtml(input, {
				allowedTags: [],
			});
		case "object":
			// loop through object
			const paramNames = Object.keys(input);
			paramNames.forEach((elm) => {
				input[elm] = sanitizeHtml(input[elm], {
					allowedTags: [],
				});
			});
			return input;
		default:
			return input;
	}
};

exports.simpleValidation = (input, message) => {
	if (!input) {
		return {
			status: -1,
			message,
		};
	}
};

exports.validateEmail = (email) => {
	if (!email) {
		return false;
	}
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

exports.validateMobile = (mobile) => {
	if (!mobile || !mobile.startsWith("+") || mobile.length !== 13) {
		return false;
	}

	return true;
};
