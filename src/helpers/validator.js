const sanitizeHtml = require("sanitize-html");

exports.sanitize = (input) => {
	if (Array.isArray(input)) {
		return sanitizeArray(input);
	}

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
				let inputValue = input[elm];
				if (Array.isArray(inputValue)) {
					sanitizeArray(inputValue);
				} else {
					inputValue = sanitizeHtml(inputValue, {
						allowedTags: [],
					});
				}
			});
			return input;
		default:
			return input;
	}
};

const sanitizeArray = (input) => {
	for (let index = 0; index < input.length; index++) {
		input[index] = this.sanitize(input[index]);
	}

	return input;
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
	const validLengths = [12, 13];
	if (
		!mobile ||
		!mobile.startsWith("+") ||
		!validLengths.includes(mobile.length)
	) {
		return false;
	}

	return true;
};
