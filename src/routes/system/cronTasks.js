const express = require("express");
const router = express.Router();

const {
	cancelAbandonedGames,
	renewBasicAccounts,
	cancelPendingInvitations,
	endSurvivalLeague,
} = require("../../controllers/System/CronTaskController");

router.get("/renewBasicAccounts", async (req, res) => {
	res.json(await renewBasicAccounts(req.query.token));
});

router.get("/cancelAbandonedGames", async (req, res) => {
	res.json(await cancelAbandonedGames(req.query.token));
});

router.get("/cancelPendingInvitations", async (req, res) => {
	res.json(await cancelPendingInvitations(req.query.token));
});

router.get("/endSurvivalLeague", async (req, res) => {
	res.json(await endSurvivalLeague(req.query.token));
});

module.exports = router;
