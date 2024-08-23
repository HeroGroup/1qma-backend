const express = require("express");
const router = express.Router();

const { getShopItems } = require("../../controllers/Client/ShopController");

/**
 * @openapi
 * '/shop':
 *  get:
 *     tags:
 *     - Shop
 *     summary: fetch shop items
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
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
	res.json(await getShopItems(req.query));
});

module.exports = router;
