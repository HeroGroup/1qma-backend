const express = require("express");
const router = express.Router();
const {
	getCharityCategories,
	addCharityCategory,
	updateCharityCategory,
	deleteCharityCategory,
} = require("../../controllers/Admin/CharityCategoryController");
const imageUpload = require("../../services/imageUpload");

/**
 * @openapi
 * '/admin/charityCategories':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all charity categories
 */
router.get("/", async (req, res) => {
	res.json(await getCharityCategories());
});

/**
 * @openapi
 * '/admin/charityCategories/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add charity category
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - title
 *              - activities
 *              - icon
 *            properties:
 *              title:
 *                type: string
 *                default: Aid Children
 *              activities:
 *                type: array
 *                default: [{title: "Building Schools"}]
 *              icon:
 *                type: string
 *                format: binary
 *              order:
 *                type: number
 *                default: 1
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addCharityCategory(req.body, req.file));
});

/**
 * @openapi
 * '/admin/charityCategories/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update charity category
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - title
 *              - activities
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              title:
 *                type: string
 *                default: Aid Children
 *              activities:
 *                type: array
 *                default: [{title: "Building Schools"}]
 *              icon:
 *                type: string
 *                format: binary
 *              order:
 *                type: number
 *                default: 1
 *              isActive:
 *                type: boolean
 *                default: false
 */
router.post("/update", imageUpload.single("icon"), async (req, res) => {
	res.json(await updateCharityCategory(req.body, req.file));
});

/**
 * @openapi
 * '/admin/charityCategories/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete charity category
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
	res.json(await deleteCharityCategory(req.body));
});

module.exports = router;
