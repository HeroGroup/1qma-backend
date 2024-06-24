const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.isLoggedIn = async (req, res, next) => {
	if (req.session.user) {
		next();
	} else if (req.headers["Access-Token"]) {
		const accessToken = req.headers["Access-Token"];
		req.session.user = await loginWithAuthToken(accessToken);
		next();
	} else {
		res.sendStatus(401);
	}
};
