import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import 'dotenv/config'
import User from '../models/User.js';
import './asgardeo.js' // register Asgardeo OIDC strategy

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        profilePic: profile.photos[0].value,
                        role: 'STUDENT',
                        isNewUser: true,
                    })
                }
                done(null, user)
            } catch (err) {
                done(err, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport
