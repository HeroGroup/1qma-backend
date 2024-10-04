const express = require("express");
const router = express.Router();

const {
	renewBasicAccounts,
} = require("../../controllers/System/CronTaskController");

router.get("/renewBasicAccounts", async (req, res) => {
	res.json(await renewBasicAccounts(req.query.token));
});

module.exports = router;
