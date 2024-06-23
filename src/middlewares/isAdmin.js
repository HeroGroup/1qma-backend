exports.isAdmin = (req, res, next) => {
	console.log("req.user", req.user);
	if (req.user && req.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
