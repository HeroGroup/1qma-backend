const passport = require("passport");
const {
	googleOAuth,
	loginWithEmail,
} = require("../../controllers/Client/AuthController");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const reasons = ["register", "login", "join_to_wait_list"];
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
				const reason = request.session.reason;

				if (!reasons.includes(reason)) {
					return done(null, fail("No reason for google auth!", reason));
				}

				if (reason === "register") {
					if (!request.session.user) {
						return done(null, fail("Base user is invalid!", reason));
					}

					if (request.session.user.googleId) {
						return done(
							null,
							fail(
								`You are aleardy logged in as ${request.session.user.email}`,
								reason
							)
						);
					}
				}
				const googleOAuthResult = await googleOAuth(
					profile,
					request.session.user,
					reason
				);

				return done(null, googleOAuthResult);
			}
		)
	);
};
