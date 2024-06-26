const passport = require("passport");
const {
	googleOAuth,
	loginWithEmail,
} = require("../../controllers/Client/AuthController");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const LocalStrategy = require("passport-local").Strategy;

exports.passportInit = () => {
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (user, done) {
		done(null, user);
	});

	passport.use(
		new LocalStrategy({ usernameField: "email" }, async function (
			email,
			password,
			done
		) {
			const loginResult = await loginWithEmail({ email, password });

			const { status, message, data: user } = loginResult;

			if (status === -1) {
				return done(message, false);
			}

			return done(null, user);
		})
	);

	passport.use(
		new GoogleStrategy(
			{
				clientID: env.authServiceProviders.google.clientId,
				clientSecret: env.authServiceProviders.google.clientSecret,
				callbackURL: env.authServiceProviders.google.callbackUrl,
				passReqToCallback: true,
			},
			async function (request, accessToken, refreshToken, profile, done) {
				const user = await googleOAuth(profile, accessToken);
				console.log("google oAuth", user);
				Object.assign(user, request.session.user);
				console.log("assign", user);
				return done(null, user);
			}
		)
	);
};
