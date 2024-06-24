exports.hasCompletedSignup = (req, res, next) => {
	if (req.session.user && req.session.user.hasCompletedSignup) {
		next();
	} else {
		res.sendStatus(401);
	}
};
