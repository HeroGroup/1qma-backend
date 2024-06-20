module.exports = {
	environment: process.env.ENVIRONMENT || "staging",
	appName: process.env.APP_NAME || "1QMA Games",
	appUrl: process.env.APP_URL || "http://localhost:3000",
	port: process.env.PORT || 3000,
	dbHost: process.env.DB_HOST || "127.0.0.1",
	dbName: process.env.DB_NAME || "1qma",
	dbPort: process.env.DB_PORT || "27017",
	saltRounds: process.env.SALT_ROUNDS || 10,
	authServiceProviders: {
		google: {
			clientId:
				process.env.GOOGLE_CLIENT_ID ||
				"1064499296285-idd99p6nn0ocs9ddi74jtpohdrrj9v6r.apps.googleusercontent.com",
			clientSecret:
				process.env.GOOGLE_CLIENT_SECRET ||
				"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",
			callbackUrl:
				process.env.GOOGLE_CALLBACK_URL ||
				"http://localhost:3000/auth/google/callback",
		},
		twitter: {
			consumerKey: process.env.TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
			callbackUrl: process.env.TWITTER_CALLBACK_URL,
		},
		facebook: {},
		apple: {},
	},
};
