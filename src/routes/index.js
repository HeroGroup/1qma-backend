const express = require("express");
const router = express.Router();
const { join } = require("node:path");
const {
	getFAQs,
	getTermsOfService,
	getPrivacyPolicies,
	contactUs,
} = require("../controllers/Client/ClientController");

router.get("/", (req, res) => {
	// res.send("Hello from DEV Team!");
	res.sendFile(join(__basedir, "index.html"));
});

/**
 * @openapi
 * '/FAQs':
 *  get:
 *     tags:
 *     - General
 *     summary: fetch frequently asked questions (faq)
 */
router.get("/FAQs", async (req, res) => {
	res.json(await getFAQs());
});

/**
 * @openapi
 * '/termsOfService':
 *  get:
 *     tags:
 *     - General
 *     summary: fetch terms of service
 */
router.get("/termsOfService", async (req, res) => {
	res.json(await getTermsOfService(req.session.user?.preferedLanguage));
});

/**
 * @openapi
 * '/privacyPolicies':
 *  get:
 *     tags:
 *     - General
 *     summary: fetch privacy policies
 */
router.get("/privacyPolicies", async (req, res) => {
	res.json(await getPrivacyPolicies(req.session.user?.preferedLanguage));
});

/**
 * @openapi
 * '/contactUs':
 *  post:
 *     tags:
 *     - Client
 *     summary: send a message
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - name
 *              - message
 *            properties:
 *              email:
 *                type: string
 *                default: navid@gmail.com
 *              name:
 *                type: string
 *                format: Navid Hero
 *              message:
 *                type: string
 *                format: Hello and thank you
 */
router.post("/contactUs", async (req, res) => {
	res.json(await contactUs(req.body));
});

module.exports = router;
