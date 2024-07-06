const express = require("express");
const router = express.Router();
// const { join } = require("node:path");
const { getSocketClient } = require("../helpers/utils");

router.get("/", (req, res) => {
	res.send("Hello from DEV Team!");
	// res.sendFile(join(__basedir, "index.html"));
});

module.exports = router;
