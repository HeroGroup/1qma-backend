exports.isLoggedIn = async (req, res, next) => {
	console.log("isLoggedIn", req.session.user);
	if (req.session.user?._id) {
		next();
	} else {
		res.sendStatus(401);
	}
};
