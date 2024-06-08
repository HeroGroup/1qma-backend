const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../../models/User");

passport.use(
	new GoogleStrategy(
		{
			clientID: env.authServiceProviders.google.clientId,
			clientSecret: env.authServiceProviders.google.clientSecret,
			callbackURL: env.appUrl + env.authServiceProviders.googel.callbackUrl,
			passReqToCallback: true,
		},
		function (request, accessToken, refreshToken, profile, done) {
			User.findOrCreate({ googleId: profile.id }, function (err, user) {
				return done(err, user);
			});
		}
	)
);
