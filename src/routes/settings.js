const express = require("express");
const router = express.Router();

const {
	getSettings,
	addSetting,
	updateSetting,
	deleteSetting,
} = require("../controllers/SettingController");

/**
 * @openapi
 * '/admin/settings':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all settings
 */
router.get("/", async (req, res) => {
	res.json(await getSettings());
});

/**
 * @openapi
 * '/admin/settings/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add setting
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - key
 *              - name
 *              - value
 *            properties:
 *              key:
 *                type: string
 *                default: NEXT_VERIFICATION_MINUTES
 *              name:
 *                type: string
 *                default: next verification (minutes)
 *              value:
 *                type: string
 *                default: 2
 */
router.post("/add", async (req, res) => {
	res.json(await addSetting(req.body));
});

/**
 * @openapi
 * '/admin/settings/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update setting
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - value
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              value:
 *                type: string
 *                default: 5
 */
router.post("/update", async (req, res) => {
	res.json(await updateSetting(req.body));
});

router.post("/delete", async (req, res) => {
	res.json(await deleteSetting(req.body));
});

module.exports = router;
