exports.isAdmin = async (req, res, next) => {
	if (req.session.user?._id && req.session.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
