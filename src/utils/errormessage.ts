/**
 * Centralized Error and Success Messages
 * All error and success messages should be defined here
 * and imported from this file throughout the application
 */

/**
 * Error Messages - Authentication & Authorization
 */
export const ErrorMessage = {
  // Auth errors
  TOKEN_MISSING: 'Token missing',
  INVALID_TOKEN: 'Invalid token',
  AUTHENTICATION_FAILED: 'Authentication failed',

  // Authorization errors
  FORBIDDEN: 'Forbidden',
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // Role-based errors
  BRANCH_NOT_ASSIGNED: 'Branch not assigned',
  HQ_NOT_ASSIGNED: 'HQ not assigned',
  INVALID_ROLE: 'Invalid role',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  PARAMETER_VALIDATION_FAILED: 'Parameter validation failed',
  QUERY_VALIDATION_FAILED: 'Query validation failed',

  // Database errors
  DATABASE_ERROR: 'Database error',
  RECORD_NOT_FOUND: 'Record not found',
  RECORD_ALREADY_EXISTS: 'Record already exists',

  // Generic errors
  BAD_REQUEST: 'Bad request',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Not found',
  UNAUTHORIZED: 'Unauthorized',
  CONFLICT: 'Conflict',
} as const;

/**
 * Success Messages
 */
export const SuccessMessage = {
  // Auth success
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed',

  // CRUD success
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  RETRIEVED: 'Retrieved',

  // Specific operation success
  STOCK_UPDATED: 'Stock updated',
  DISCOUNT_UPDATED: 'Discount updated',
  MENU_RETRIEVED: 'Menu retrieved',
  PRODUCT_CREATED: 'Product created',
  PRODUCT_UPDATED: 'Product updated',
  PRODUCT_DISABLED: 'Product disabled',
  MENU_ITEM_UPDATED_SUCCESSFULLY: 'Menu item updated successfully',
  MENU_ITEM_DELETED_SUCCESSFULLY: 'Menu item deleted successfully',
  BRANCH_MENU_UPDATED: 'Branch menu updated',
  STOCK_REPORT_RETRIEVED: 'Stock report retrieved',
} as const;

/**
 * Type for Error Message keys
 */
export type ErrorMessageKey = keyof typeof ErrorMessage;

/**
 * Type for Success Message keys
 */
export type SuccessMessageKey = keyof typeof SuccessMessage;

/**
 * Get error message by key
 */
export const getErrorMessage = (key: ErrorMessageKey): string => {
  return ErrorMessage[key];
};

/**
 * Get success message by key
 */
export const getSuccessMessage = (key: SuccessMessageKey): string => {
  return SuccessMessage[key];
};

