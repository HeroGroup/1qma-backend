const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.json(req.session);
});

router.get("/session/set/:key/:value", (req, res) => {
	const { key, value } = req.params;
	req.session[key] = value;
	res.send(`${key} set to ${value}`);
});

module.exports = router;
