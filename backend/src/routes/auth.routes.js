// Google & Asgardeo OAuth routes
import express from 'express'
import passport from 'passport'
import authMiddleware from '../middleware/auth.middleware.js'
import { handleOAuthCallback, selectRole, getMe, updateProfile, handleLogout } from '../controllers/auth.controller.js'


const router = express.Router()

// ── Google OAuth ─────────────────────────────────────────────
// redirect user to Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', session: false })
)

// Google redirects back here
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    handleOAuthCallback
)

// ── Asgardeo OIDC ───────────────────────────────────────────
// redirect user to Asgardeo
router.get('/asgardeo',
    passport.authenticate('asgardeo', { prompt: 'login', session: false })
)

// Asgardeo redirects back here
router.get('/asgardeo/callback',
    passport.authenticate('asgardeo', { failureRedirect: '/login', session: false }),
    handleOAuthCallback
)

// ── Common routes ───────────────────────────────────────────
router.patch('/select-role', authMiddleware, selectRole)
router.get('/me', authMiddleware, getMe)
router.put('/update-profile', authMiddleware, updateProfile)
router.get('/logout', handleLogout)

export default router