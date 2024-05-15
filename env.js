module.exports = {
	environment: process.env.ENVIRONMENT || "staging",
	appName: process.env.APP_NAME || "1QMA Games",
	port: process.env.PORT || 3000,
	saltRounds: process.env.SALT_ROUNDS || 10,
	nextVerificationMinutes: process.env.NEXT_VERIFICATION_MINUTES || 5,
};
