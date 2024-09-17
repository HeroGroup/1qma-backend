exports.nullStringToNull = (req, res, next) => {
	const bodyParams = Object.keys(req.body);

	bodyParams.forEach((elm) => {
		if (req.body[elm] === "null") {
			req.body[elm] = null;
		}
	});

	next();
};
