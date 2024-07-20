const express = require("express");
const app = express();
if (app.get("env") === "production") {
	globalThis.env = require("./env.js");
} else {
	globalThis.env = require("./env.development.js");
}
const { createServer } = require("node:http");
const { Server } = require("socket.io");
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
const authRoutes = require("./src/routes/client/auth");
const adminRoutes = require("./src/routes/admin/_admin");
const accountTypesRoutes = require("./src/routes/admin/accountTypes");
const categoriesRoutes = require("./src/routes/admin/categories");
const indexRoutes = require("./src/routes/index");
const settingsRoutes = require("./src/routes/admin/settings");
const usersRoutes = require("./src/routes/admin/users");
const clientGeneralRoutes = require("./src/routes/client/general");
const gameRoutes = require("./src/routes/client/game");
const gamesRoutes = require("./src/routes/client/games");
const {
	sanitizeRequestInputs,
} = require("./src/middlewares/sanitizeRequestInputs");
const { isAdmin } = require("./src/middlewares/isAdmin");
const { hasCompletedSignup } = require("./src/middlewares/hasCompletedSignup");
const { isLoggedIn } = require("./src/middlewares/isLoggedIn");
const { passportInit } = require("./src/services/auth/passport");
const { exitGame } = require("./src/controllers/Client/GameController.js");
async function main() {
	const whiteList = [
		"https://api.staging.1qma.games",
		"http://localhost:3000", // local backend
		"https://staging.1qma.games",
		"https://admin.staging.1qma.games",
		"http://localhost:4200", // local client
		"http://localhost:4400", // local admin
		"https://admin.socket.io", // socket io admin UI
	];

	const corsOptions = {
		credentials: true,
		origin: function (origin, callback) {
			if (whiteList.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
	};

	const server = createServer(app);
	const io = new Server(server, {
		connectionStateRecovery: {},
		cors: corsOptions,
	});

	globalThis.__basedir = __dirname;
	globalThis.moment = require("moment");
	globalThis.success = (message, data, status = 1) => {
		return {
			status,
			message,
			data,
		};
	};
	globalThis.fail = (message, data, status = -1) => {
		return {
			status,
			message,
			data,
		};
	};

	mongoose
		.connect(`mongodb://${env.db.host}:${env.db.port}/${env.db.name}`)
		.catch((err) => console.log(err));

	let redisClient = createClient();
	redisClient.connect().catch(console.error);
	let redisStore = new RedisStore({
		client: redisClient,
		prefix: `${env.db.name}:`,
	});

	app.use(cors(corsOptions));
	app.use(express.json());
	app.use(morgan("dev"));

	app.set("query parser", function (str) {
		return qs.parse(str);
	});

	const sessionName = env.session.name;
	const sessionKey = env.session.key;

	const sess = {
		name: sessionName,
		secret: sessionKey,
		store: redisStore,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 30 * 24 * 60 * 60 * 1000,
		},
	};

	if (app.get("env") === "production") {
		app.set("trust proxy", 1);
		// sess.cookie.domain = env.app.domain;
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
	app.use("/games", hasCompletedSignup, gamesRoutes);
	app.use("/", indexRoutes);
	app.use(express.static("public"));

	app.use(
		"/api-docs",
		swaggerUI.serve,
		swaggerUI.setup(swaggerSpec, { explorer: true })
	);

	app.use(sanitizeRequestInputs);

	// Sharing the session context
	io.engine.use(session(sess));

	io.engine.on("connection_error", (err) => {
		console.log(err.code, err.message, err.context);
	});

	io.on("connection", (socket) => {
		let userId = "";
		const sessionId = socket.request?.sessionID;
		if (sessionId) {
			sess.store.get(sessionId, (error, sessionData) => {
				if (sessionData) {
					userId = sessionData.user._id;
					sessionData.socketId = socket.id;
					sess.store.set(sessionId, sessionData);
				}
			});
		}

		socket.on("disconnecting", async () => {
			for (const room of socket.rooms) {
				if (room !== socket.id) {
					console.log(await exitGame({ id: userId, gameId: room }, socket.id));
				}
			}
		});
	});

	globalThis.io = io;

	const port = env.app.port;
	server.listen(port, () => {
		console.log(
			`${env.app.name} app is listening on port ${port} in ${app.get("env")}`
		);
	});
}

main();
