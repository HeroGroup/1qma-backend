exports.sameUser = (req, res, next) => {
	if (
		(req.user && req.user._id === req.body.id) ||
		req.user._id === req.params.id
	) {
		next();
	} else {
		res.sendStatus(401);
	}
};
