const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.isLoggedIn = async (req, res, next) => {
	console.log(req.session.user);
	console.log(req.header("Access-Token"));
	if (!req.session.user && req.header("Access-Token")) {
		req.session.user = await loginWithAuthToken(req.header("Access-Token"));
	}

	console.log(req.session.user);

	if (req.session.user?._id) {
		next();
	} else {
		res.sendStatus(401);
	}
};
