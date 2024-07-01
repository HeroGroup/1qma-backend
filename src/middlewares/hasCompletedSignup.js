exports.hasCompletedSignup = async (req, res, next) => {
	if (req.session.user?._id && req.session.user.hasCompletedSignup) {
		next();
	} else {
		res.sendStatus(401);
	}
};
