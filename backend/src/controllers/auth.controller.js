// OAuth callback and JWT issue logic
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_OPTIONS = { algorithm: 'HS256', expiresIn: '7d' }

const getPrimaryClientUrl = () => {
    const rawUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    return rawUrl.split(',')[0].trim()
}

export const handleOAuthCallback = (req, res) => {
    const clientUrl = getPrimaryClientUrl()

    const user = req.user

    if (user.isDisabled) {
        console.warn(`[AUTH] Blocked login for disabled account: ${user.email}`)
        return res.redirect(`${clientUrl}/login?error=Account suspended. Please contact support.`)
    }

    console.info(`[AUTH] Successful OAuth login: ${user.email} (${user.provider || 'google'})`)

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isNewUser: user.isNewUser,
            provider: user.provider || 'google',
        },
        process.env.JWT_SECRET,
        JWT_OPTIONS
    )

    res.redirect(`${clientUrl}/auth/callback?token=${token}`)
}

export const selectRole = async (req, res, next) => {
    try {
        const { role } = req.body

        if (!['STUDENT', 'RECRUITER'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' })
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { role, isNewUser: false },
            { new: true }
        )

        // issue a fresh token with updated role
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isNewUser: false,
                provider: user.provider || 'google',
            },
            process.env.JWT_SECRET,
            JWT_OPTIONS
        )

        res.json({ success: true, token, user })
    } catch (err) {
        next(err)
    }
}


export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, profilePic } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, profilePic },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // issue a fresh token with updated profile info
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isNewUser: user.isNewUser,
                provider: user.provider || 'google',
            },
            process.env.JWT_SECRET,
            JWT_OPTIONS
        );

        res.json({ success: true, token, user });
    } catch (err) {
        next(err);
    }
}

export const handleLogout = (req, res) => {
    const provider = req.query.provider;
    const orgName = process.env.ASGARDEO_ORG_NAME;

    if (provider === 'asgardeo' && orgName) {
        const clientUrl = getPrimaryClientUrl();
        const postLogoutRedirect = encodeURIComponent(`${clientUrl}/login`);
        const endSessionUrl = `https://api.asgardeo.io/t/${orgName}/oidc/logout?post_logout_redirect_uri=${postLogoutRedirect}`;
        return res.json({ success: true, logoutUrl: endSessionUrl });
    }

    res.json({ success: true, logoutUrl: null });
}
