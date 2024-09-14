const express = require("express");
const router = express.Router();

const {
	getFAQs,
	addFAQ,
	updateFAQ,
	deleteFAQ,
} = require("../../controllers/Admin/FAQController");

/**
 * @openapi
 * '/admin/faqs':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all faqs
 */
router.get("/", async (req, res) => {
	res.json(await getFAQs());
});

/**
 * @openapi
 * '/admin/faqs/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add faq
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - question
 *              - answer
 *              - order
 *            properties:
 *              question:
 *                type: string
 *                default: How can I refer someone?
 *              answer:
 *                type: string
 *                default: simply share your referal code with them.
 *              order:
 *                type: number
 *                default: 1

 */
router.post("/add", async (req, res) => {
	res.json(await addFAQ(req.body));
});

/**
 * @openapi
 * '/admin/faqs/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update faq
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - question
 *              - answer
 *              - order
 *              - isActive
 *            properties:
 *              id:
 *                type: string
 *                default: 675839785438579245039274509
 *              question:
 *                type: string
 *                default: How can I refer someone?
 *              answer:
 *                type: string
 *                default: simply share your referal code with them.
 *              order:
 *                type: number
 *                default: 1
 *              isActive:
 *                type: boolean
 *                default: false
 */
router.post("/update", async (req, res) => {
	res.json(await updateFAQ(req.body));
});

/**
 * @openapi
 * '/admin/faqs/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete faq
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
	res.json(await deleteFAQ(req.body));
});

module.exports = router;
