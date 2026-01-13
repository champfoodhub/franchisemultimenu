import { z } from 'zod';

/**
 * Login validation schema
 * Validates email and password for authentication
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Product creation validation schema (HQ)
 * Validates name, base_price, and category
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  base_price: z
    .number()
    .positive('Base price must be a positive number'),
  category: z
    .string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Product update validation schema (HQ)
 * All fields are optional but validated if provided
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters')
    .optional(),
  base_price: z
    .number()
    .positive('Base price must be a positive number')
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters')
    .optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Stock update validation schema (Branch)
 * Validates stock value must be non-negative integer
 */
export const stockUpdateSchema = z.object({
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;

/**
 * Discount update validation schema (Branch)
 * Validates discount is between 0 and 30 percent
 */
export const discountUpdateSchema = z.object({
  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(30, 'Discount cannot exceed 30%'),
});

export type DiscountUpdateInput = z.infer<typeof discountUpdateSchema>;

/**
 * Menu item update validation schema (HQ)
 * Validates menu item fields
 */
export const menuItemUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Menu item name is required')
    .min(2, 'Menu item name must be at least 2 characters')
    .max(100, 'Menu item name must be less than 100 characters')
    .optional(),
  price: z
    .number()
    .positive('Price must be a positive number')
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  is_active: z
    .boolean()
    .optional(),
});

export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;

/**
 * Branch menu update validation schema
 * Validates stock and discount_percent for branch-specific menu
 */
export const branchMenuUpdateSchema = z.object({
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional(),
  discount_percent: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(30, 'Discount cannot exceed 30%')
    .optional(),
});

export type BranchMenuUpdateInput = z.infer<typeof branchMenuUpdateSchema>;

/**
 * Menu item creation validation schema (HQ)
 */
export const createMenuItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID format'),
  branch_id: z.string().uuid('Invalid branch ID format').optional(),
  name: z
    .string()
    .min(1, 'Menu item name is required')
    .min(2, 'Menu item name must be at least 2 characters')
    .max(100, 'Menu item name must be less than 100 characters'),
  price: z
    .number()
    .positive('Price must be a positive number'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  image_url: z.string().url('Invalid image URL format').optional(),
  is_active: z.boolean().default(true),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

/**
 * Schedule query parameters schema
 */
export const scheduleQuerySchema = z.object({
  type: z.enum(['TIME_SLOT', 'SEASONAL']).optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ScheduleQueryInput = z.infer<typeof scheduleQuerySchema>;

