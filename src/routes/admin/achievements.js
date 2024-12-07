const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");

const {
	getAchievements,
	addAchievement,
	updateAchievement,
	toggleActiveAchievement,
	deleteAchievement,
} = require("../../controllers/Admin/AchievementController");

/**
 * @openapi
 * '/admin/achievements':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all achievements
 */
router.get("/", async (req, res) => {
	res.json(await getAchievements());
});

/**
 * @openapi
 * '/admin/achievements/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add achievement
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - condition
 *              - conditionQuantity
 *              - reward
 *              - rewardQuantity
 *              - showModal
 *              - description
 *              - descriptionFa
 *              - link
 *              - icon
 *            properties:
 *              condition:
 *                type: string
 *                default: level
 *              conditionQuantity:
 *                type: number
 *                default: 8
 *              reward:
 *                type: string
 *                default: silver
 *              rewardQuantity:
 *                type: number
 *                default: 4
 *              showModal:
 *                type: boolean
 *                default: true
 *              description:
 *                type: string
 *                default: some description
 *              descriptionFa:
 *                type: string
 *                default: پاره ای توضیحات
 *              link:
 *                type: string
 *                default: https://1qma.games
 *              icon:
 *                type: string
 *                format: binary
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addAchievement(req.body, req.file));
});

/**
 * @openapi
 * '/admin/achievements/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update achievement
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - condition
 *              - conditionQuantity
 *              - reward
 *              - rewardQuantity
 *              - showModal
 *              - description
 *              - descriptionFa
 *              - link
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              condition:
 *                type: string
 *                default: level
 *              conditionQuantity:
 *                type: number
 *                default: 8
 *              reward:
 *                type: string
 *                default: silver
 *              rewardQuantity:
 *                type: number
 *                default: 4
 *              showModal:
 *                type: boolean
 *                default: true
 *              description:
 *                type: string
 *                default: some description
 *              descriptionFa:
 *                type: string
 *                default: پاره ای توضیحات
 *              link:
 *                type: string
 *                default: https://1qma.games
 *              icon:
 *                type: string
 *                format: binary
 */
router.post("/update", imageUpload.single("icon"), async (req, res) => {
	res.json(await updateAchievement(req.body, req.file));
});

/**
 * @openapi
 * '/admin/achievements/toggleActive':
 *  post:
 *     tags:
 *     - Admin
 *     summary: toggle achievement active
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - isActive
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              isActive:
 *                type: boolean
 *                default: true
 */
router.post("/toggleActive", async (req, res) => {
	res.json(await toggleActiveAchievement(req.body));
});

/**
 * @openapi
 * '/admin/achievements/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete achievement
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
 *                default: 664ef9c67e591d53fdf65f0b
 */
router.post("/delete", async (req, res) => {
	res.json(await deleteAchievement(req.body));
});

module.exports = router;
