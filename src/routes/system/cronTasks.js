const express = require("express");
const router = express.Router();

const {
	cancelAbandonedGames,
	renewBasicAccounts,
} = require("../../controllers/System/CronTaskController");

router.get("/renewBasicAccounts", async (req, res) => {
	res.json(await renewBasicAccounts(req.query.token));
});
router.get("/cancelAbandonedGames", async (req, res) => {
	res.json(await cancelAbandonedGames(req.query.token));
});

module.exports = router;
