const { loginWithAuthToken } = require("../controllers/Client/AuthController");

exports.sameUser = async (req, res, next) => {
	console.log("before", req.session.user);
	console.log("Access-Token", req.header("Access-Token"));
	if (!req.session.user && req.header("Access-Token")) {
		req.session.user = await loginWithAuthToken(req.header("Access-Token"));
	}
	console.log("after", req.session.user);
	if (
		req.session.user?._id &&
		(req.session.user._id?.toString() === req.body.id ||
			req.session.user._id?.toString() === req.params.id)
	) {
		next();
	} else {
		res.sendStatus(401);
	}
};
