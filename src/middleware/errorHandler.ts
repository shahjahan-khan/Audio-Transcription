import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            details: err.message
        });
    }

    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' && 'code' in err && (err as any).code === 11000) {
        return res.status(409).json({
            status: 'error',
            message: 'Duplicate entry'
        });
    }

    // Default error
    console.error('Unhandled error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
