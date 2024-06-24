const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.sameUser = async (req, res, next) => {
	if (!req.session.user) {
		req.session.user = await loginWithAuthToken(req.header("Access-Token"));
	}

	if (
		req.session.user._id === req.body.id ||
		req.session.user._id === req.params.id
	) {
		next();
	} else {
		res.sendStatus(401);
	}
};
