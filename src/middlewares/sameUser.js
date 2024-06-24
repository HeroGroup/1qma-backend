exports.sameUser = (req, res, next) => {
	if (
		(req.session.user && req.session.user._id === req.body.id) ||
		req.session.user._id === req.params.id
	) {
		next();
	} else {
		res.sendStatus(401);
	}
};
