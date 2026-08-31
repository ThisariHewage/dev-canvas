import passport from 'passport'
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect'
import 'dotenv/config'
import User from '../models/User.js'

const orgName = process.env.ASGARDEO_ORG_NAME

passport.use(
    'asgardeo',
    new OpenIDConnectStrategy(
        {
            issuer: `https://api.asgardeo.io/t/${orgName}/oauth2/token`,
            authorizationURL: `https://api.asgardeo.io/t/${orgName}/oauth2/authorize`,
            tokenURL: `https://api.asgardeo.io/t/${orgName}/oauth2/token`,
            userInfoURL: `https://api.asgardeo.io/t/${orgName}/oauth2/userinfo`,
            clientID: process.env.ASGARDEO_CLIENT_ID,
            clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
            callbackURL: '/api/auth/asgardeo/callback',
            scope: ['openid', 'profile', 'email'],
        },
        async (issuer, profile, done) => {
            try {
                console.log('[Asgardeo] Raw profile:', profile)
                console.log('[Asgardeo] Profile _json:', profile?._json)

                const asgardeoId = profile.id || profile._json?.sub
                const email =
                    profile.emails?.[0]?.value ||
                    profile._json?.email ||
                    profile._json?.preferred_username ||
                    profile._json?.username ||
                    (asgardeoId ? `${asgardeoId}@asgardeo.user` : null)

                const name =
                    profile.displayName ||
                    (profile._json?.given_name ? `${profile._json.given_name} ${profile._json?.family_name || ''}`.trim() : null) ||
                    profile._json?.name ||
                    profile._json?.preferred_username ||
                    profile._json?.username ||
                    'Asgardeo User'

                console.log('[Asgardeo] Extracted data:', { asgardeoId, email, name })

                if (!asgardeoId) {
                    return done(new Error('No subject/id received from Asgardeo'), null)
                }

                // Try to find user by asgardeoId first, then by email
                let user = await User.findOne({ asgardeoId })

                if (!user && email) {
                    user = await User.findOne({ email })
                    if (user) {
                        // Link existing user (e.g. Google user) with Asgardeo
                        user.asgardeoId = asgardeoId
                        user.provider = 'asgardeo'
                        await user.save()
                    }
                }

                if (!user) {
                    user = await User.create({
                        asgardeoId,
                        email,
                        name,
                        profilePic: profile.photos?.[0]?.value || '',
                        provider: 'asgardeo',
                        role: 'STUDENT',
                        isNewUser: true,
                    })
                }

                done(null, user)
            } catch (err) {
                console.error('[Asgardeo] Error in verify callback:', err)
                done(err, null)
            }
        }
    )
)

export default passport
