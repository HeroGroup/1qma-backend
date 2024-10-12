const express = require("express");
const router = express.Router();
const { join } = require("node:path");
const {
	getFAQs,
	getTermsOfService,
	getPrivacyPolicies,
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
	res.json(await getTermsOfService());
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
	res.json(await getPrivacyPolicies());
});

module.exports = router;
