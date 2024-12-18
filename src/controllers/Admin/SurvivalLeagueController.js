const SurvivalLeague = require("../../models/SurvivalLeague");
const { handleException, removeFile } = require("../../helpers/utils");

exports.getSurvivalLeagues = async () => {
	try {
		const survivalLeagues = await SurvivalLeague.find();

		return success("SurvivalLeagues retrieved successfully!", survivalLeagues);
	} catch (e) {
		return handleException(e);
	}
};

exports.addSurvivalLeague = async (params, icon) => {
	try {
		const { title, titleFa, startDate, endDate, totalScore, totalGames } =
			params;

		if (!title || !titleFa) {
			return fail("Invalid title!");
		}

		if (!startDate) {
			return fail("Invalid start Date!");
		}

		if (!endDate && !totalScore && !totalGames) {
			return fail("Invalid end criteria!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const survivalLeague = new SurvivalLeague({
			title,
			titleFa,
			startDate,
			endDate,
			...(isNaN(totalScore) ? {} : { totalScore }),
			...(isNaN(totalGames) ? {} : { totalGames }),
			icon: icon?.path || "",
			isActive: true,
		});

		await SurvivalLeague.updateMany({}, { isActive: false });
		await survivalLeague.save();

		return success("Addedd successfully!", survivalLeague);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateSurvivalLeague = async (params, icon) => {
	try {
		const { id, title, titleFa, startDate, endDate, totalScore, totalGames } =
			params;

		if (!id || !title || !titleFa || !startDate) {
			return fail("invalid parameters!");
		}

		if (!endDate && !totalScore && !totalGames) {
			return fail("Invalid end criteria!");
		}

		let survivalLeague = await SurvivalLeague.findById(id);

		if (icon && survivalLeague.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${survivalLeague.icon}`);
		}

		const iconPath = icon
			? icon.path.replace("public/", "")
			: survivalLeague?.icon;

		survivalLeague = await SurvivalLeague.findByIdAndUpdate(
			id,
			{
				title,
				titleFa,
				startDate,
				endDate,
				...(isNaN(totalScore) ? { totalScore: 0 } : { totalScore }),
				...(isNaN(totalGames) ? { totalGames: 0 } : { totalGames }),
				icon: iconPath,
			},
			{ new: true }
		);

		return success("Updated successfully!", survivalLeague);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteSurvivalLeague = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid survivalLeague id!");
		}

		const survivalLeague = await SurvivalLeague.findById(id);

		if (survivalLeague?.icon) {
			removeFile(`${__basedir}/public/${survivalLeague.icon}`);
		}

		await SurvivalLeague.deleteOne({ _id: id });

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
