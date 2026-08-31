// Role-based access guard (STUDENT, RECRUITER, ADMIN)
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' })
        }
        next()
    }
}

export default roleMiddleware