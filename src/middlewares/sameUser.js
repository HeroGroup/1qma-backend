exports.sameUser = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else if (
		req.session.user?._id &&
		(req.session.user._id?.toString() === req.body.id ||
			req.session.user._id?.toString() === req.params.id)
	) {
		next();
	} else {
		res.sendStatus(403);
	}
};
