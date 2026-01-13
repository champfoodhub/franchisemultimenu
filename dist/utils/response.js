/*
 * Success response helper
 */
export const success = (res, data, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
};
/**
 * Error response helper
 */
export const error = (res, message = 'Error', code = 400) => {
    return res.status(code).json({
        success: false,
        message,
    });
};
