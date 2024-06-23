exports.hasCompletedSignup = (req, res, next) => {
	if (req.user && req.user.hasCompletedSignup) {
		next();
	} else {
		res.sendStatus(401);
	}
};
