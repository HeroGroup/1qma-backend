const express = require("express");
globalThis.env = require("./env.js");
const swaggerUI = require("swagger-ui-express");
const { swaggerSpec } = require("./src/services/swagger.js");
const { indexRoutes } = require("./src/routes/index");
const { usersRoutes } = require("./src/routes/users");
const { authRoutes } = require("./src/routes/auth");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

globalThis.moment = require("moment");
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

mongoose
	.connect("mongodb://127.0.0.1:27017/1qma")
	.catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
indexRoutes(app);
usersRoutes(app);
authRoutes(app);
app.use(
	"/api-docs",
	swaggerUI.serve,
	swaggerUI.setup(swaggerSpec, { explorer: true })
);

const port = env.port;
app.listen(port, () => {
	console.log(`${env.appName} app is listening on port ${port}`);
});
