const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../../models/User");
const init = require("./init");

passport.use(
	new TwitterStrategy(
		{
			consumerKey: env.authServiceProviders.twitter.consumerKey,
			consumerSecret: env.authServiceProviders.twitter.consumerSecret,
			callbackURL: env.authServiceProviders.twitter.callbackUrl,
		},
		function (accessToken, refreshToken, profile, done) {
			var searchQuery = {
				name: profile.displayName,
			};

			var updates = {
				name: profile.displayName,
				someID: profile.id,
			};

			var options = {
				upsert: true,
			};

			// update the user if s/he exists or add a new user
			User.findOneAndUpdate(
				searchQuery,
				updates,
				options,
				function (err, user) {
					if (err) {
						return done(err);
					} else {
						return done(null, user);
					}
				}
			);
		}
	)
);

// serialize user into the session
init();

module.exports = passport;
