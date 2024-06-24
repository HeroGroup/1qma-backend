const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.isLoggedIn = async (req, res, next) => {
	if (req.session.user) {
		next();
	} else if (req.header("Access-Token")) {
		req.session.user = await loginWithAuthToken(req.header("Access-Token"));
		next();
	} else {
		res.sendStatus(401);
	}
};
