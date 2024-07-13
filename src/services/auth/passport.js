const passport = require("passport");
const {
	googleOAuth,
	loginWithEmail,
	facebookAuth,
} = require("../../controllers/Client/AuthController");
const { authReasons } = require("../../helpers/utils");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;

exports.passportInit = () => {
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (user, done) {
		done(null, user);
	});

	// email, password login
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

	// google login
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

				if (!authReasons.includes(reason)) {
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

	// facebook login
	passport.use(
		new FacebookStrategy(
			{
				clientID: env.authServiceProviders.facebook.clientId,
				clientSecret: env.authServiceProviders.facebook.clientSecret,
				callbackURL: env.authServiceProviders.facebook.callbackUrl,
				profileFields: ["id", "displayName", "email"],
				enableProof: true,
				passReqToCallback: true,
			},
			async function (accessToken, refreshToken, profile, cb) {
				const reason = req.session.reason;

				if (!authReasons.includes(reason)) {
					return done(null, fail("No reason for google auth!", reason));
				}

				if (reason === "register") {
					if (!req.session.user) {
						return done(null, fail("Base user is invalid!", reason));
					}

					if (req.session.user.facebookId) {
						return done(
							null,
							fail(
								`You are aleardy logged in as ${req.session.user.email}`,
								reason
							)
						);
					}
				}
				const facebookAuthResult = await facebookAuth(
					profile,
					req.session.user,
					reason
				);

				return done(null, facebookAuthResult);
			}
		)
	);
};
