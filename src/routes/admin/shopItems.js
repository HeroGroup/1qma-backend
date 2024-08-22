const express = require("express");
const router = express.Router();

const {
	getShopItems,
	addShopItem,
	updateShopItem,
	deleteShopItem,
	toggleActiveShopItem,
} = require("../../controllers/Admin/ShopItemController");

const imageUpload = require("../../services/imageUpload");

/**
 * @openapi
 * '/admin/shopItems':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all shop items
 */
router.get("/", async (req, res) => {
	res.json(await getShopItems());
});

/**
 * @openapi
 * '/admin/shopItems/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add shop item
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - type
 *              - details
 *              - coinPrice
 *              - realPrice
 *              - icon
 *            properties:
 *              type:
 *                type: string
 *                default: feature
 *              details:
 *                type: object
 *                default: {count: 5, title: invitations}
 *              coinPrice:
 *                type: object
 *                default: {price: 150, coin: gold}
 *              realPrice:
 *                type: number
 *                default: 3
 *              icon:
 *                type: file
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addShopItem(req.body));
});

/**
 * @openapi
 * '/admin/shopItems/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update shop item
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - type
 *              - details
 *              - coinPrice
 *              - realPrice
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              type:
 *                type: string
 *                default: feature
 *              details:
 *                type: object
 *                default: {count: 5, title: invitations}
 *              coinPrice:
 *                type: object
 *                default: {price: 150, coin: gold}
 *              realPrice:
 *                type: number
 *                default: 3
 *              icon:
 *                type: file
 */
router.post("/update", imageUpload.single("icon"), async (req, res) => {
	res.json(await updateShopItem(req.body, req.file));
});

/**
 * @openapi
 * '/admin/shopItems/toggleActive':
 *  post:
 *     tags:
 *     - Admin
 *     summary: toggle shop item activation
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
 *                default: false
 */
router.post("/toggleActive", async (req, res) => {
	res.json(await toggleActiveShopItem(req.body, req.file));
});

/**
 * @openapi
 * '/admin/shopItems/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete shop item
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
	res.json(await deleteShopItem(req.body));
});

module.exports = router;
