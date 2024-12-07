const Achievement = require("../../models/Achievement");
const { handleException, removeFile } = require("../../helpers/utils");
const {
	achievementConditions,
	achievementRewards,
} = require("../../helpers/constants");

exports.getAchievements = async () => {
	try {
		const achievements = await Achievement.find();

		return success("Achievements retrieved successfully!", {
			achievements,
			achievementConditions,
			achievementRewards,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.addAchievement = async (params, icon) => {
	try {
		const {
			condition,
			conditionQuantity,
			reward,
			rewardQuantity,
			showModal,
			description,
			descriptionFa,
			link,
		} = params;

		if (!condition || !conditionQuantity || !reward || !rewardQuantity) {
			return fail("Invalid input parameters!");
		}

		if (icon) {
			icon.path = icon.path.replace("public/", "");
		}

		const achievement = new Achievement({
			condition: { type: condition, quantity: parseInt(conditionQuantity) },
			reward: { type: reward, quantity: parseInt(rewardQuantity) },
			showModal,
			description,
			descriptionFa,
			icon: icon?.path || "",
			link,
			isActive: true,
		});
		await achievement.save();

		return success("Addedd successfully!", achievement);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateAchievement = async (params, icon) => {
	try {
		const {
			id,
			condition,
			conditionQuantity,
			reward,
			rewardQuantity,
			showModal,
			description,
			descriptionFa,
			link,
		} = params;

		if (!id || !condition || !conditionQuantity || !reward || !rewardQuantity) {
			return fail("invalid input parameters!");
		}

		let achievement = await Achievement.findById(id);

		if (icon && achievement.icon) {
			// new icon available, remove and unlink current icon
			removeFile(`${__basedir}/public/${achievement.icon}`);
		}

		const iconPath = icon
			? icon.path.replace("public/", "")
			: achievement?.icon;

		achievement = await Achievement.findByIdAndUpdate(
			id,
			{
				icon: iconPath,
				condition: { type: condition, quantity: parseInt(conditionQuantity) },
				reward: { type: reward, quantity: parseInt(rewardQuantity) },
				showModal,
				description,
				descriptionFa,
				link,
			},
			{ new: true }
		);

		return success("Updated successfully!", achievement);
	} catch (e) {
		return handleException(e);
	}
};

exports.toggleActiveAchievement = async (params) => {
	try {
		const { id, isActive } = params;

		if (!id) {
			return fail("Invalid input parameters");
		}

		const achievement = await Achievement.findByIdAndUpdate(
			id,
			{ isActive },
			{ new: true }
		);

		return success("Updated successfully!", achievement);
	} catch (e) {
		return handleException(e);
	}
};

exports.deleteAchievement = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid achievement id!");
		}

		const achievement = await Achievement.findById(id);

		if (achievement?.icon) {
			removeFile(`${__basedir}/public/${achievement.icon}`);
		}

		await Achievement.findByIdAndDelete(id);

		return success("Deleted successfully!");
	} catch (e) {
		return handleException(e);
	}
};
