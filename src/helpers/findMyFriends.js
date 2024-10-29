const User = require("../models/User");
const Setting = require("../models/Setting");
const { objectId } = require("./utils");

exports.findMyFriends = async (userId) => {
	if (!userId) {
		return { friendsIds: [], friendsIdsString: [] };
	}

	const friendsLevelsSetting = await Setting.findOne({
		key: "FRIENDS_LEVELS",
	});
	const level = friendsLevelsSetting?.value || 3;

	let friends = [];
	let friendsIds = [objectId(userId)];
	const allFriendsIds = [];
	const allFriendsIdsString = [];

	for (let i = 1; i <= level; i++) {
		friends = await User.find(
			{
				"referer._id": { $in: friendsIds },
				hasCompletedSignup: true,
				isActive: true,
			},
			{ _id: 1 }
		);

		friendsIds = [];

		for (const friend of friends) {
			friendsIds.push(friend._id);
			allFriendsIds.push(friend._id);
			allFriendsIdsString.push(friend._id.toString());
		}
	}

	return {
		friendsIds: allFriendsIds,
		friendsIdsString: allFriendsIdsString,
	};
};
