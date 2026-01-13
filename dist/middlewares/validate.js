import { ErrorMessage } from '../utils/errormessage';
/**
 * Parse Zod validation errors into a more readable format
 */
const formatZodErrors = (zodError) => {
    return zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
};
/**
 * Creates a validation middleware for a given Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * Usage:
 * router.post('/login', validate(loginSchema), loginController);
 */
export const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = formatZodErrors(result.error);
            // Format error messages for client
            const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
            _res.status(400).json({
                success: false,
                message: ErrorMessage.VALIDATION_FAILED,
                errors: errors,
                error: errorMessages,
            });
            return;
        }
        // Attach validated data to request for use in controllers
        req.body = result.data;
        next();
    };
};
/**
 * Validate route params (for IDs, etc.)
 */
export const validateParams = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const errors = formatZodErrors(result.error);
            const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
            _res.status(400).json({
                success: false,
                message: ErrorMessage.PARAMETER_VALIDATION_FAILED,
                errors: errors,
                error: errorMessages,
            });
            return;
        }
        req.params = result.data;
        next();
    };
};
/**
 * Validate query parameters
 */
export const validateQuery = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = formatZodErrors(result.error);
            const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
            _res.status(400).json({
                success: false,
                message: ErrorMessage.QUERY_VALIDATION_FAILED,
                errors: errors,
                error: errorMessages,
            });
            return;
        }
        req.query = result.data;
        next();
    };
};
