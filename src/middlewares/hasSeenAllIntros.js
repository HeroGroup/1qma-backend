exports.hasSeenAllIntros = async (req, res, next) => {
	if (!req.session.user) {
		res.sendStatus(401);
	} else if (req.session.user?._id) {
		const hasSeenIntros = req.session.user.hasSeenIntros;
		const hasSeenIntrosKeys = Object.keys(hasSeenIntros);
		const notSeen = [];
		hasSeenIntrosKeys.forEach((elm) => {
			if (!hasSeenIntros[elm]) {
				notSeen.push(elm);
			}
		});
		if (notSeen.length === 0) {
			next();
		} else {
			res.json({
				status: -1,
				message: `Before playing games, you need to see introduction of ${notSeen.join(
					", "
				)}.`,
			});
		}
	} else {
		res.sendStatus(403);
	}
};
