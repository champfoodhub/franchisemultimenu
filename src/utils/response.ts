import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/*
 * Success response helper
 */
export const success = <T>(
  res: Response,
  data: T,
  message = 'Success'
): Response<ApiResponse<T>> => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response helper
 */
export const  error = (
  res: Response,
  message = 'Error',
  code = 400
): Response<ApiResponse<null>> => {
  return res.status(code).json({
    success: false,
    message,
  });
};
