const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.isAdmin = async (req, res, next) => {
	console.log("isAdmin");
	if (!req.session.user && req.header("Access-Token")) {
		req.session.user = await loginWithAuthToken(req.header("Access-Token"));
	}

	if (req.session.user?._id && req.session.user.userType === "admin") {
		next();
	} else {
		res.sendStatus(401);
	}
};
