import { supabase } from '../config/supabase';
import { ErrorMessage } from '../utils/errormessage';
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: ErrorMessage.TOKEN_MISSING });
        return;
    }
    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
        res.status(401).json({ message: ErrorMessage.INVALID_TOKEN });
        return;
    }
    // Attach authenticated Supabase user to request
    req.user = data.user;
    next();
};
