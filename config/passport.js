const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");


passport.use(
    new GoogleStrategy(

        {
            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: "http://localhost:3000/auth/google/callback"
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const email = profile.emails[0].value;

                let user = await User.findOne({
                    email: email
                });


                // Existing user

                if (user) {

                    if (user.status === "blocked") {

                        return done(null, false, {
                            message: "blocked"
                        });

                    }

                    return done(null, user);

                }


                // New Google user

                user = new User({

                    name: profile.displayName,

                    email: email,

                    profileImage: profile.photos
                        ? profile.photos[0].value
                        : null,

                    role: "user",

                    status: "active",

                    isVerified: true,

                    authProvider: "google"

                });


                await user.save();

                return done(null, user);

            } catch (error) {

                return done(error, null);

            }

        }

    )
);


passport.serializeUser((user, done) => {

    done(null, user._id);

});


passport.deserializeUser(async (id, done) => {

    try {

        const user = await User.findById(id);

        done(null, user);

    } catch (error) {

        done(error, null);

    }

});


module.exports = passport;