module.exports = {
	environment: process.env.ENVIRONMENT,
	appName: process.env.APP_NAME,
	appUrl: process.env.APP_URL,
	frontAppUrl: process.env.FRONT_APP_URL,
	appDomain: process.env.APP_DOMAIN,
	port: process.env.PORT,
	dbHost: process.env.DB_HOST,
	dbName: process.env.DB_NAME,
	dbPort: process.env.DB_PORT,
	saltRounds: process.env.SALT_ROUNDS,
	authServiceProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackUrl: process.env.GOOGLE_CALLBACK_URL,
			successRedirectUrl: process.env.GOOGLE_SUCCESS_REDIRECT_URL,
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
