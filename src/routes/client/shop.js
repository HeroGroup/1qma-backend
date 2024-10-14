const express = require("express");
const router = express.Router();
const {
	getShopItems,
	shopWithCoin,
} = require("../../controllers/Client/ShopController");
const { sameUser } = require("../../middlewares/sameUser");

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

/**
 * @openapi
 * '/shop/payWithCoin':
 *  post:
 *     tags:
 *     - Shop
 *     summary: pay with coin credit
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - shopItemId
 *            properties:
 *              id:
 *                type: string
 *                default: 63738495886737657388948
 *              shopItemId:
 *                type: string
 *                default: 63738495886737657388948
 */
router.post("/payWithCoin", sameUser, async (req, res) => {
	const payWithCoinResult = await shopWithCoin(req.body);
	if (payWithCoinResult.status === 1) {
		// update user assets in session
		req.session.user.assets.coins = payWithCoinResult.data.newBalance;
	}
	res.json(payWithCoinResult);
});

module.exports = router;
