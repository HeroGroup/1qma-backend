module.exports = {
	environment: process.env.ENVIRONMENT || "staging",
	appName: process.env.APP_NAME || "1QMA Games",
	port: process.env.PORT || 3000,
	dbHost: process.env.DB_HOST || "127.0.0.1",
	dbName: process.env.DB_NAME || "1qma",
	dbPort: process.env.DB_PORT || "27017",
	saltRounds: process.env.SALT_ROUNDS || 10,
};
