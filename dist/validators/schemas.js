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
