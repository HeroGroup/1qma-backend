exports.hasSeenAllIntros = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else if (req.session.user?._id) {
		const hasSeenIntros = req.session.user.hasSeenIntros;
		const hasSeenIntrosKeys = Object.keys(hasSeenIntros);
		let hasSeenAllIntros = true;
		hasSeenIntrosKeys.forEach((elm) => {
			if (!hasSeenIntros[elm]) {
				hasSeenAllIntros = false;
			}
		});
		if (hasSeenAllIntros) {
			next();
		} else {
			res.json({
				status: -1,
				message:
					"Before playing games, you need to see all introductions and play tutorial game!",
			});
		}
	} else {
		res.sendStatus(403);
	}
};
