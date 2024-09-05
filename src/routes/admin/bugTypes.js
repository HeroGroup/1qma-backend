const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");

const {
	getBugTypes,
	addBugType,
	updateBugType,
	deleteBugType,
} = require("../../controllers/Admin/BugTypeController");

/**
 * @openapi
 * '/admin/bugTypes':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all bug types
 */
router.get("/", async (req, res) => {
	res.json(await getBugTypes());
});

/**
 * @openapi
 * '/admin/bugTypes/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add bug type
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - category
 *              - subCategories
 *              - icon
 *            properties:
 *              category:
 *                type: string
 *                default: Register
 *              subCategories:
 *                type: array
 *                default: [{title: "register sub category 1"}, {title: "register sub category 2"}]
 *              icon:
 *                type: string
 *                format: binary
 *              order:
 *                type: number
 *                format: 1
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addBugType(req.body, req.file));
});

/**
 * @openapi
 * '/admin/bugTypes/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update bug type
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - category
 *              - subCategories
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              category:
 *                type: string
 *                default: Register
 *              subCategories:
 *                type: array
 *                default: [{title: "register sub category 1"}, {title: "register sub category 2"}]
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
	res.json(await updateBugType(req.body, req.file));
});

/**
 * @openapi
 * '/admin/bugTypes/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete bug type
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
	res.json(await deleteBugType(req.body));
});

module.exports = router;
