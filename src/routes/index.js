const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.send("Hello From 1QMA DEV Team!");
});

module.exports = router;
