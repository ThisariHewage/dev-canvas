// Verifies JWT from Authorization header
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    try {
        // A02/A07: Enforce HS256 algorithm to prevent algorithm confusion attacks
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
        req.user = decoded
        next()
    } catch (err) {
        // A09: Log failed auth attempts (without exposing token)
        console.warn(`[AUTH] Invalid token attempt from ${req.ip}: ${err.message}`)
        return res.status(403).json({ success: false, message: 'Invalid token' })
    }
}

export default authMiddleware