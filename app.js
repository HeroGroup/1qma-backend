const express = require("express");
const qs = require("qs");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUI = require("swagger-ui-express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
const passport = require("passport");

const { swaggerSpec } = require("./src/services/swagger.js");

const app = express();
globalThis.env = require("./env.js");

const authRoutes = require("./src/routes/client/auth");
const adminRoutes = require("./src/routes/admin/_admin");
const accountTypesRoutes = require("./src/routes/admin/accountTypes");
const categoriesRoutes = require("./src/routes/admin/categories");
const indexRoutes = require("./src/routes/index");
const settingsRoutes = require("./src/routes/admin/settings");
const usersRoutes = require("./src/routes/admin/users");
const clientGeneralRoutes = require("./src/routes/client/general");
const gameRoutes = require("./src/routes/client/game");
const {
	sanitizeRequestInputs,
} = require("./src/middlewares/sanitizeRequestInputs");
const { isAdmin } = require("./src/middlewares/isAdmin");
const { hasCompletedSignup } = require("./src/middlewares/hasCompletedSignup");
const { isLoggedIn } = require("./src/middlewares/isLoggedIn");
const { passportInit } = require("./src/services/auth/passport");

globalThis.__basedir = __dirname;
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

let redisClient = createClient();
redisClient.connect().catch(console.error);
let redisStore = new RedisStore({
	client: redisClient,
	prefix: `${env.dbName}:`,
});

const origin = [
	"https://staging.1qma.games",
	"https://admin.staging.1qma.games",
	"http://localhost:4200",
];
const corsOptions = {
	credentials: true,
	origin,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.set("query parser", function (str) {
	return qs.parse(str);
});

const sess = {
	store: redisStore,
	resave: false,
	saveUninitialized: true,
	secret: "whatissecret",
	cookie: {},
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	sess.cookie.domain = env.appDomain;
	// sess.cookie.httpOnly = false; // default is true
	sess.cookie.sameSite = "none";
	sess.cookie.secure = true;
}

app.use(session(sess));

passportInit();

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/accountTypes", isAdmin, accountTypesRoutes);
app.use("/admin/categories", isAdmin, categoriesRoutes);
app.use("/admin/users", isAdmin, usersRoutes);
app.use("/admin/settings", isAdmin, settingsRoutes);
app.use("/client", isLoggedIn, clientGeneralRoutes);
app.use("/game", hasCompletedSignup, gameRoutes);
app.use("/", indexRoutes);
app.use(express.static("public"));

app.use(
	"/api-docs",
	swaggerUI.serve,
	swaggerUI.setup(swaggerSpec, { explorer: true })
);

app.use(sanitizeRequestInputs);

const port = env.port;
app.listen(port, () => {
	console.log(
		`${env.appName} app is listening on port ${port} in ${app.get("env")}`
	);
});
