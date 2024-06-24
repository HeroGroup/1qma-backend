exports.isAdmin = (req, res, next) => {
	if (req.session.user && req.session.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
