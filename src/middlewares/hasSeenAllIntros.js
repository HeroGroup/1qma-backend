exports.hasSeenAllIntros = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else if (req.session.user?._id) {
		const hasSeenIntros = req.session.user.hasSeenIntros;
		const hasSeenIntrosKeys = Object.keys(hasSeenIntros);
		hasSeenIntrosKeys.forEach((elm) => {
			if (!hasSeenIntros[elm]) {
				return fail(
					"Before playing games, you need to see all introductions and play tutorial game!"
				);
			}
		});
		next();
	} else {
		res.sendStatus(403);
	}
};
