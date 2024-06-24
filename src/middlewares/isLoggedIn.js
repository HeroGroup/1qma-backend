const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.isLoggedIn = async (req, res, next) => {
	if (req.session.user) {
		next();
	} else if (req.headers["Access-Token"]) {
		req.session.user = await loginWithAuthToken(req.headers["Access-Token"]);
		next();
	} else {
		res.sendStatus(401);
	}
};
