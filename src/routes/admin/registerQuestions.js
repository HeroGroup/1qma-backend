const express = require("express");
const router = express.Router();

const {
	listQuestions,
	addQuestion,
	updateQuestion,
	toggleActiveQuestion,
	deleteQuestion,
} = require("../../controllers/Admin/RegisterQuestionController");

/**
 * @openapi
 * '/admin/registerQuestions':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all register questions
 */
router.get("/", async (req, res) => {
	res.json(await listQuestions());
});

/**
 * @openapi
 * '/admin/registerQuestions/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add register question
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - question
 *              - type
 *            properties:
 *              question:
 *                type: string
 *                default: What do you usually do in your free time?
 *              type:
 *                type: string
 *                default: multiple_options
 *              options:
 *                type: string
 *                default: ["sport", "leasure", "reading", "outing"]
 *              placeholder:
 *                type: string
 *                default: sports
 *              order:
 *                type: number
 *                default: 1
 */
router.post("/add", async (req, res) => {
	res.json(await addQuestion(req.body));
});

/**
 * @openapi
 * '/admin/registerQuestions/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update register question
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - question
 *              - type
 *            properties:
 *              id:
 *                type: string
 *                default: 675839785438579245039274509
 *              question:
 *                type: string
 *                default: What do you usually do in your free time?
 *              type:
 *                type: string
 *                default: multiple_options
 *              options:
 *                type: string
 *                default: ["sport", "leasure", "reading", "outing"]
 *              placeholder:
 *                type: string
 *                default: sports
 *              order:
 *                type: number
 *                default: 1
 */
router.post("/update", async (req, res) => {
	res.json(await updateQuestion(req.body));
});

/**
 * @openapi
 * '/admin/registerQuestions/toggleActive':
 *  post:
 *     tags:
 *     - Admin
 *     summary: toggle active register question
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
 *                default: 657864985632985789437598437589
 *              isActive:
 *                type: boolean
 *                default: false
 */
router.post("/toggleActive", async (req, res) => {
	res.json(await toggleActiveQuestion(req.body));
});

/**
 * @openapi
 * '/admin/registerQuestions/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete register question
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
 *                default: 657864985632985789437598437589
 */
router.post("/delete", async (req, res) => {
	res.json(await deleteQuestion(req.body));
});

module.exports = router;
