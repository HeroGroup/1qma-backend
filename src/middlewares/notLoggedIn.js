exports.notLoggedIn = async (req, res, next) => {
	if (req.session.user?._id) {
		res.sendStatus(403);
	} else {
		next();
	}
};
