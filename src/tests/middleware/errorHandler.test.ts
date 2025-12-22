import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, asyncHandler } from '../../middleware/errorHandler';

describe('ErrorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(400, 'Bad Request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should allow custom isOperational flag', () => {
      const error = new AppError(500, 'Server Error', false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(404, 'Not Found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not Found',
      });
    });

    it('should handle Mongoose ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: 'Validation failed',
      });
    });

    it('should handle MongoDB duplicate key error', () => {
      const error: any = new Error('Duplicate key');
      error.name = 'MongoServerError';
      error.code = 11000;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Duplicate entry',
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('asyncHandler', () => {
    it('should execute successful async function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(mockFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Async error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(mockFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should catch AppError and pass to next', async () => {
      const error = new AppError(400, 'Bad Request');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(mockFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors', async () => {
      const error = new Error('Sync error');
      const mockFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const wrappedFn = asyncHandler(mockFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
