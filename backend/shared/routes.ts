import { z } from 'zod';
import { 
  insertUserSchema, insertBranchSchema, insertProductSchema, 
  insertInventorySchema, insertScheduleSchema, insertScheduleItemSchema,
  products, branches, inventory, schedules, scheduleItems, users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<Omit<typeof users.$inferSelect, 'password'>>(),
        401: z.object({ message: z.string() }),
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<Omit<typeof users.$inferSelect, 'password'> | null>(), 
      }
    }
  },
  
  // HQ Endpoints
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },

  branches: {
    list: {
      method: 'GET' as const,
      path: '/api/branches',
      responses: {
        200: z.array(z.custom<typeof branches.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/branches',
      input: insertBranchSchema,
      responses: {
        201: z.custom<typeof branches.$inferSelect>(),
      }
    }
  },

  // Branch Specific Endpoints
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/branches/:branchId/inventory',
      responses: {
        200: z.array(z.custom<typeof inventory.$inferSelect & { product: typeof products.$inferSelect }>()),
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/inventory/:id',
      input: insertInventorySchema.partial(),
      responses: {
        200: z.custom<typeof inventory.$inferSelect>(),
      }
    }
  },

  // Schedules
  schedules: {
    list: {
      method: 'GET' as const,
      path: '/api/schedules',
      responses: {
        200: z.array(z.custom<typeof schedules.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/schedules',
      input: insertScheduleSchema,
      responses: {
        201: z.custom<typeof schedules.$inferSelect>(),
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/schedules/:id',
      input: insertScheduleSchema.partial(),
      responses: {
        200: z.custom<typeof schedules.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    addItems: {
      method: 'POST' as const,
      path: '/api/schedules/:id/items',
      input: z.object({
        productIds: z.array(z.number())
      }),
      responses: {
        200: z.array(z.custom<typeof scheduleItems.$inferSelect>()),
      }
    },
    active: {
      method: 'GET' as const,
      path: '/api/menu/active',
      // Optional branchId to check stock availability
      input: z.object({ branchId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
