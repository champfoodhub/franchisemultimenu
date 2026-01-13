import { ErrorMessage } from '../utils/errormessage';
/**
 * Allowed roles middleware
 */
export const allowRoles = (...roles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        res.status(403).json({ message: ErrorMessage.FORBIDDEN });
        return;
    }
    if (!roles.includes(req.user.role)) {
        res.status(403).json({ message: ErrorMessage.FORBIDDEN });
        return;
    }
    next();
};
