const express = require("express");
const router = express.Router();

const {
	getBugReports,
} = require("../../controllers/Admin/BugReportController");

/**
 * @openapi
 * '/admin/bugReports':
 *  get:
 *     tags:
 *     - Admin
 *     summary: get all bug reports
 */
router.get("/", async (req, res) => {
	res.json(await getBugReports(req.query));
});

module.exports = router;
