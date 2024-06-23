exports.isAdmin = (req, res, next) => {
	if (req.user && req.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
