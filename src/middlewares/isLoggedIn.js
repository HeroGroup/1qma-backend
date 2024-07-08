exports.isLoggedIn = async (req, res, next) => {
	if (req.session.user?._id) {
		next();
	} else {
		res.sendStatus(401);
	}
};
