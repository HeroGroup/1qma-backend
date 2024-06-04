const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUI = require("swagger-ui-express");
const { swaggerSpec } = require("./src/services/swagger.js");

const app = express();
globalThis.env = require("./env.js");

const authRoutes = require("./src/routes/auth");
const accountTypesRoutes = require("./src/routes/accountTypes");
const categoriesRoutes = require("./src/routes/categories");
const indexRoutes = require("./src/routes/index");
const settingsRoutes = require("./src/routes/settings");
const usersRoutes = require("./src/routes/users");
const {
	sanitizeRequestInputs,
} = require("./src/middlewares/sanitizeRequestInputs.js");

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
	.connect(`mongodb://${env.dbHost}:${env.dbPort}/${env.dbName}`)
	.catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/admin/accountTypes", accountTypesRoutes);
app.use("/admin/categories", categoriesRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/admin/settings", settingsRoutes);
app.use("/", indexRoutes);

app.use(
	"/api-docs",
	swaggerUI.serve,
	swaggerUI.setup(swaggerSpec, { explorer: true })
);

app.use(sanitizeRequestInputs);

const port = env.port;
app.listen(port, () => {
	console.log(`${env.appName} app is listening on port ${port}`);
});
