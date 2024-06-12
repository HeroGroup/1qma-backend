const express = require("express");
const router = express.Router();
const {
	getCategories,
	addCategory,
	updateCategory,
	deleteCategory,
} = require("../controllers/Admin/CategoryController");

/**
 * @openapi
 * '/admin/categories':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all settings
 */
router.get("/", async (req, res) => {
	res.json(await getCategories());
});

/**
 * @openapi
 * '/admin/categories/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add category
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *            properties:
 *              name:
 *                type: string
 *                default: History
 *              icon:
 *                type: file
 */
router.post("/add", async (req, res) => {
	res.json(await addCategory(req.body));
});

/**
 * @openapi
 * '/admin/categories/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update category
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - name
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              name:
 *                type: string
 *                default: Free Discussion
 *              icon:
 *                type: file
 */
router.post("/update", async (req, res) => {
	res.json(await updateCategory(req.body));
});

/**
 * @openapi
 * '/admin/categories/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete category
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
	res.json(await deleteCategory(req.body));
});

module.exports = router;
