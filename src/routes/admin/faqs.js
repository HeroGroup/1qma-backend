const express = require("express");
const router = express.Router();

const {
	getFAQs,
	addFAQ,
	updateFAQ,
	deleteFAQ,
	getTerms,
	getPrivacyPolicies,
	updateTermsOfService,
	updatePrivacyPolicies,
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

/**
 * @openapi
 * '/admin/faqs/termsOfService':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get terms of service
 */
router.get("/termsOfService", async (req, res) => {
	res.json(await getTerms());
});

/**
 * @openapi
 * '/admin/faqs/privacyPolicies':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get privacy policies
 */
router.get("/privacyPolicies", async (req, res) => {
	res.json(await getPrivacyPolicies());
});

/**
 * @openapi
 * '/admin/faqs/updateTermsOfService':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update terms of service
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - terms
 *            properties:
 *              terms:
 *                type: string
 *                default: Terms of Service
 */
router.post("/updateTermsOfService", async (req, res) => {
	res.json(await updateTermsOfService(req.body));
});

/**
 * @openapi
 * '/admin/faqs/updatePrivacyPolicies':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update privacy policies
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - privacyPolicies
 *            properties:
 *              privacyPolicies:
 *                type: string
 *                default: privacy policies
 */
router.post("/updatePrivacyPolicies", async (req, res) => {
	res.json(await updatePrivacyPolicies(req.body));
});

module.exports = router;
