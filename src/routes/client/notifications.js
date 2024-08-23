const express = require("express");
const {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} = require("../../controllers/Client/NotificationController");
const { sameUser } = require("../../middlewares/sameUser");
const router = express.Router();

/**
 * @openapi
 * '/notifications':
 *  get:
 *     tags:
 *     - Notification
 *     summary: fetch all user notifications
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 */
router.get("/", async (req, res) => {
	res.json(await getNotifications(req.session.user._id, req.query));
});

/**
 * @openapi
 * '/notifications/markAsRead':
 *  post:
 *     tags:
 *     - Notifications
 *     summary: mark one single notification as read
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - notificationId
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              notificationId:
 *                type: String
 *                default: 63738495886737657388948
 */
router.post("/markAsRead", sameUser, async (req, res) => {
	res.json(await markNotificationAsRead(req.body.notificationId));
});

/**
 * @openapi
 * '/notifications/markAllAsRead':
 *  post:
 *     tags:
 *     - Notifications
 *     summary: mark all notification as read
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 */
router.post("/markAllAsRead", sameUser, async (req, res) => {
	res.json(await markAllNotificationsAsRead(req.session.user._id));
});

module.exports = router;
