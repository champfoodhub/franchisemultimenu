import { User } from '@supabase/supabase-js';
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        branch_id?: string;
        hq_id?: string;
        role?: string;
      };
    }
  }
}

