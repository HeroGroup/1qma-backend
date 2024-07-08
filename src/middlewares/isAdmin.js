exports.isAdmin = async (req, res, next) => {
	console.log("isAdmin", req.session.user);
	if (req.session.user?._id && req.session.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
