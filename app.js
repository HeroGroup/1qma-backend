const express = require("express");
const mongoose = require("mongoose");
const app = express();
const env = require("./env.js");
const moment = require("moment");

globalThis.env = env;
globalThis.moment = moment;
globalThis.success = (message, data) => {
	return {
		status: 1,
		message,
		data,
	};
};
globalThis.fail = (message, data) => {
	return {
		status: -1,
		message,
		data,
	};
};

const { indexRoutes } = require("./src/routes/index");
const { usersRoutes } = require("./src/routes/users");
const { authRoutes } = require("./src/routes/auth");

mongoose
	.connect("mongodb://127.0.0.1:27017/1qma")
	.catch((err) => console.log(err));

app.use(express.json());

indexRoutes(app);
usersRoutes(app);
authRoutes(app);

const port = env.port;
app.listen(port, () => {
	console.log(`${env.appName} app is listening on port ${port}`);
});
