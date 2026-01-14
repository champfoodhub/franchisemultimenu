import axios from 'axios';
import useAuthStore from '../stores/auth';

const api = axios.create({
  baseURL: (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state on token expiration
      useAuthStore.getState().logout();
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

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
  INVALID_CREDENTIALS: 'Invalid email or password',

  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_CREATION_FAILED: 'Failed to create user',
  USER_UPDATE_FAILED: 'Failed to update user',

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
  SERVER_ERROR: 'Server error',

  // Menu Schedule errors
  SCHEDULE_NOT_FOUND: 'Schedule not found',
  SCHEDULE_CREATION_FAILED: 'Failed to create schedule',
  SCHEDULE_UPDATE_FAILED: 'Failed to update schedule',
  SCHEDULE_DELETION_FAILED: 'Failed to delete schedule',
  INVALID_TIME_RANGE: 'Invalid time range: end time must be after start time',
  INVALID_DATE_RANGE: 'Invalid date range: end date must be after start date',
  TIMEZONE_CONVERSION_FAILED: 'Failed to convert timezone',
  SCHEDULE_ITEM_NOT_FOUND: 'Schedule item not found',
  SCHEDULE_ITEM_CREATION_FAILED: 'Failed to add items to schedule',
  SCHEDULE_ITEM_DELETION_FAILED: 'Failed to remove items from schedule',
  NO_ACTIVE_SCHEDULE: 'No active schedule found for the specified time',
  TIMEZONE_REQUIRED: 'Timezone is required for seasonal schedules',
  DAY_OF_WEEK_INVALID: 'Invalid day of week values',
} as const;

/**
 * Success Messages
 */
export const SuccessMessage = {
  // Auth success
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed',
  USER_RETRIEVED: 'User retrieved',

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
  PRODUCT_RETRIEVED: 'Product retrieved',
  MENU_ITEM_UPDATED_SUCCESSFULLY: 'Menu item updated successfully',
  MENU_ITEM_DELETED_SUCCESSFULLY: 'Menu item deleted successfully',
  BRANCH_MENU_UPDATED: 'Branch menu updated',
  STOCK_REPORT_RETRIEVED: 'Stock report retrieved',
  BRANCH_RETRIEVED: 'Branch retrieved',

  // Schedule success messages
  SCHEDULE_CREATED: 'Schedule created successfully',
  SCHEDULE_UPDATED: 'Schedule updated successfully',
  SCHEDULE_DELETED: 'Schedule deleted successfully',
  SCHEDULE_RETRIEVED: 'Schedule retrieved successfully',
  SCHEDULE_ITEMS_ADDED: 'Items added to schedule successfully',
  SCHEDULE_ITEMS_REMOVED: 'Items removed from schedule successfully',
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
