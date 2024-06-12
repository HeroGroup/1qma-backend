const express = require("express");
const {
	getAccountTypes,
	addAccountType,
	updateAccountType,
	deleteAccountType,
} = require("../../controllers/Admin/AccountTypeController");
const router = express.Router();

/**
 * @openapi
 * '/admin/accountTypes':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all account types
 */
router.get("/", async (req, res) => {
	res.json(await getAccountTypes());
});

/**
 * @openapi
 * '/admin/accountTypes/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add account type
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
 *                default: Basic
 *              icon:
 *                type: file
 */
router.post("/add", async (req, res) => {
	res.json(await addAccountType(req.body));
});

/**
 * @openapi
 * '/admin/accountTypes/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update account type
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
 *                default: Bussiness
 *              icon:
 *                type: file
 */
router.post("/update", async (req, res) => {
	res.json(await updateAccountType(req.body));
});

/**
 * @openapi
 * '/admin/accountTypes/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete account type
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
	res.json(await deleteAccountType(req.body));
});

module.exports = router;
