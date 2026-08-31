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
            callbackURL: process.env.ASGARDEO_CALLBACK_URL || 'http://localhost:3000/api/auth/asgardeo/callback',
            scope: ['openid', 'profile', 'email', 'phone'],
            passReqToCallback: false,
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

                // Comprehensive extraction of contact number from Asgardeo profile / OIDC claims
                const contactNumber =
                    profile._json?.phone_number ||
                    profile._json?.mobile_number ||
                    profile._json?.mobile ||
                    profile._json?.phoneNumber ||
                    profile._json?.telephoneNumber ||
                    profile._json?.phone ||
                    profile._json?.['http://wso2.org/claims/mobile'] ||
                    profile._json?.['http://wso2.org/claims/telephoneNumber'] ||
                    profile._json?.['http://wso2.org/claims/phone_number'] ||
                    (Array.isArray(profile.phoneNumbers) ? profile.phoneNumbers[0]?.value : profile.phoneNumbers) ||
                    null

                console.log('[Asgardeo] Extracted profile data:', { asgardeoId, email, name, contactNumber })

                if (!asgardeoId) {
                    return done(new Error('No subject/id received from Asgardeo'), null)
                }

                // Find user by asgardeoId or email
                let user = await User.findOne({ asgardeoId })
                if (!user && email) {
                    user = await User.findOne({ email })
                }

                if (user) {
                    // Synchronize existing user
                    let isModified = false
                    if (!user.asgardeoId) {
                        user.asgardeoId = asgardeoId
                        user.provider = 'asgardeo'
                        isModified = true
                    }
                    if (contactNumber && user.contactNumber !== contactNumber) {
                        user.contactNumber = contactNumber
                        isModified = true
                    }
                    if (name && user.name && user.name !== name && user.name.startsWith('Asgardeo Member')) {
                        user.name = name
                        isModified = true
                    }
                    if (isModified) {
                        await user.save()
                    }
                } else {
                    // Create new user record with mapped attributes
                    user = await User.create({
                        asgardeoId,
                        email,
                        name,
                        profilePic: profile.photos?.[0]?.value || '',
                        provider: 'asgardeo',
                        role: 'STUDENT',
                        isNewUser: true,
                        contactNumber: contactNumber || '',
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
