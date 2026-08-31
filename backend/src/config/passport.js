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
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value
                const googleId = profile.id

                // 1. Search for user by googleId
                let user = await User.findOne({ googleId })

                // 2. If not found by googleId, check by email (e.g. registered via Asgardeo)
                if (!user && email) {
                    user = await User.findOne({ email })
                }

                if (user) {
                    // Synchronize/link existing account
                    let isModified = false
                    if (!user.googleId) {
                        user.googleId = googleId
                        isModified = true
                    }
                    if (!user.profilePic && profile.photos?.[0]?.value) {
                        user.profilePic = profile.photos[0].value
                        isModified = true
                    }
                    if (isModified) {
                        await user.save()
                    }
                } else {
                    // Create new user record
                    user = await User.create({
                        googleId,
                        email,
                        name: profile.displayName,
                        profilePic: profile.photos?.[0]?.value || '',
                        provider: 'google',
                        role: 'STUDENT',
                        isNewUser: true,
                    })
                }
                done(null, user)
            } catch (err) {
                console.error('[Google OAuth] Verification callback error:', err)
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
