exports.emailVerified = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else if (req.session.user?._id && req.session.user.emailVerified) {
		next();
	} else {
		res.sendStatus(403);
	}
};
