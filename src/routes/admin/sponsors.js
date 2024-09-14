const express = require("express");
const router = express.Router();
const imageUpload = require("../../services/imageUpload");

const {
	getSponsors,
	addSponsor,
	updateSponsor,
	deleteSponsor,
} = require("../../controllers/Admin/SponsorController");

/**
 * @openapi
 * '/admin/sponsors':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all sponsors
 */
router.get("/", async (req, res) => {
	res.json(await getSponsors());
});

/**
 * @openapi
 * '/admin/sponsors/add':
 *  post:
 *     tags:
 *     - Admin
 *     summary: add sponsors
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *              - link
 *              - icon
 *              - order
 *            properties:
 *              name:
 *                type: string
 *                default: Rima
 *              link:
 *                type: string
 *                default: www.rimawoodllc.com
 *              icon:
 *                type: string
 *                format: binary
 *              order:
 *                type: number
 *                format: 1
 */
router.post("/add", imageUpload.single("icon"), async (req, res) => {
	res.json(await addSponsor(req.body, req.file));
});

/**
 * @openapi
 * '/admin/sponsors/update':
 *  post:
 *     tags:
 *     - Admin
 *     summary: update sponsor
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - name
 *              - link
 *              - order
 *              - isActive
 *              - icon
 *            properties:
 *              id:
 *                type: string
 *                default: 664ef9c67e591d53fdf65f0b
 *              name:
 *                type: string
 *                default: Rima
 *              link:
 *                type: array
 *                default: www.rimawoodllc.com
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
	res.json(await updateSponsor(req.body, req.file));
});

/**
 * @openapi
 * '/admin/sponsors/delete':
 *  post:
 *     tags:
 *     - Admin
 *     summary: delete sponsor
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
	res.json(await deleteSponsor(req.body));
});

module.exports = router;
