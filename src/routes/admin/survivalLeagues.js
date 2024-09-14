const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");

const {
	getSurvivalLeagues,
	addSurvivalLeague,
	updateSurvivalLeague,
	deleteSurvivalLeague,
} = require("../../controllers/Admin/SurvivalLeagueController");

/**
 * @openapi
 * '/admin/survivalLeagues':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all survivalLeagues
 */
router.get("/", async (req, res) => {
	res.json(await getSurvivalLeagues());
});

/**
 * @openapi
 * '/admin/survivalLeagues/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add survivalLeague
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - title
 *              - icon
 *              - startDate
 *              - endDate
 *              - totalScore
 *              - totalGames
 *            properties:
 *              title:
 *                type: string
 *                default: 22 Bahman
 *              startDate:
 *                type: string
 *                default: 2024-09-14
 *              endDate:
 *                type: string
 *                default: 2024-09-14
 *              totalScore:
 *                type: number
 *                format: 20000
 *              totalGames:
 *                type: number
 *                format: 80
 *              icon:
 *                type: string
 *                format: binary
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addSurvivalLeague(req.body, req.file));
});

/**
 * @openapi
 * '/admin/survivalLeagues/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update SurvivalLeague
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - title
 *              - icon
 *              - startDate
 *              - endDate
 *              - totalScore
 *              - totalGames
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              title:
 *                type: string
 *                default: 22 Bahman
 *              startDate:
 *                type: string
 *                default: 2024-09-14
 *              endDate:
 *                type: string
 *                default: 2024-09-14
 *              totalScore:
 *                type: number
 *                format: 20000
 *              totalGames:
 *                type: number
 *                format: 80
 *              icon:
 *                type: string
 *                format: binary
 */
router.post("/update", imageUpload.single("icon"), async (req, res) => {
	res.json(await updateSurvivalLeague(req.body, req.file));
});

/**
 * @openapi
 * '/admin/survivalLeagues/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete SurvivalLeague
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
	res.json(await deleteSurvivalLeague(req.body));
});

module.exports = router;
