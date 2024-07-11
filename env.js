module.exports = {
	environment: process.env.ENVIRONMENT,
	app: {
		name: process.env.APP_NAME,
		url: process.env.APP_URL,
		domain: process.env.APP_DOMAIN,
		port: process.env.APP_PORT,
	},
	db: {
		host: process.env.DB_HOST,
		name: process.env.DB_NAME,
		port: process.env.DB_PORT,
	},
	session: {
		name: process.env.SESSION_NAME,
		key: process.env.SESSION_KEY,
	},
	frontAppUrl: process.env.FRONT_APP_URL,
	saltRounds: process.env.SALT_ROUNDS,
	authServiceProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackUrl: process.env.GOOGLE_CALLBACK_URL,
		},
		twitter: {
			consumerKey: process.env.TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
			callbackUrl: process.env.TWITTER_CALLBACK_URL,
		},
		facebook: {},
		apple: {},
		successRedirectUrl: process.env.SOCIAL_SUCCESS_REDIRECT_URL,
	},
};
