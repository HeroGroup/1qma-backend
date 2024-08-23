const { handleException, objectId } = require("../../helpers/utils");
const Notification = require("../../models/Notification");

exports.getNotifications = async (userId, params) => {
	try {
		const page = params.page || 1;
		const limit = params.limit || 5;

		const notifications = await Notification.find({ user: objectId(userId) })
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", notifications);
	} catch (e) {
		return handleException(e);
	}
};

exports.markNotificationAsRead = async (notificationId) => {
	try {
		if (!notificationId) {
			return fail("invalid notification id!");
		}

		await Notification.findByIdAndUpdate(notificationId, { hasSeen: true });
	} catch (e) {
		return handleException(e);
	}
};

exports.markAllNotificationsAsRead = async (userId) => {
	try {
		if (!userId) {
			return fail("invalid user id!");
		}

		await Notification.updateMany(
			{ user: objectId(userId) },
			{ hasSeen: true }
		);
	} catch (e) {
		return handleException(e);
	}
};
