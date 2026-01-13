/**
 * Unit tests for response utilities
 */
import { Response } from 'express';
import { success, error, ApiResponse } from '../../src/utils/response';

// Mock Express Response
const createMockResponse = (): jest.Mocked<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as jest.Mocked<Response>;
};

describe('Response Utilities', () => {
  let mockRes: jest.Mocked<Response>;

  beforeEach(() => {
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should return success response with data', () => {
      const testData = { id: '123', name: 'Test' };
      success(mockRes, testData, 'Test success');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Test success',
        data: testData,
      });
    });

    it('should return success response with null data', () => {
      success(mockRes, null, 'Deleted successfully');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Deleted successfully',
        data: null,
      });
    });

    it('should use default message when not provided', () => {
      success(mockRes, { data: 'test' });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { data: 'test' },
      });
    });

    it('should handle array data', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      success(mockRes, items, 'Items retrieved');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const jsonCall = mockRes.json.mock.calls[0][0] as ApiResponse<typeof items>;
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data).toEqual(items);
    });

    it('should handle nested objects', () => {
      const nestedData = {
        user: {
          id: '123',
          profile: {
            name: 'John',
            email: 'john@example.com',
          },
        },
      };
      success(mockRes, nestedData);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const jsonCall = mockRes.json.mock.calls[0][0] as ApiResponse<typeof nestedData>;
      expect(jsonCall.data).toEqual(nestedData);
    });
  });

  describe('error', () => {
    it('should return error response with default values', () => {
      error(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
      });
    });

    it('should return error response with custom message', () => {
      error(mockRes, 'Custom error message');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error message',
      });
    });

    it('should return error response with custom status code', () => {
      error(mockRes, 'Unauthorized', 401);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should handle 404 not found', () => {
      error(mockRes, 'Resource not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
      });
    });

    it('should handle 403 forbidden', () => {
      error(mockRes, 'Access denied', 403);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
      });
    });

    it('should handle 500 server error', () => {
      error(mockRes, 'Internal server error', 500);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});

