import { supabase } from '../config/supabase.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ message: 'Invalid token' });

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    req.user = userData;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
