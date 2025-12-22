import { Request, Response, NextFunction } from "express";
import { CreateTransactionRequest, CreateTransactionResponse } from "../types/transcription.types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { transciptionService } from "../appDependencies";

export default class TranscriptionController {
    static createTranscription = asyncHandler(async (req: Request<{}, {}, CreateTransactionRequest>, res: Response, _next: NextFunction) => {
        const { audioUrl } = req.body;

        if (!audioUrl) {
            throw new AppError(400, "audioUrl is required");
        }

        const record = await transciptionService.createTranscription(audioUrl, 'en-us');
        
        if (!record) {
            throw new AppError(500, "Failed to create transcription");
        }
        
        const response: CreateTransactionResponse = { id: record._id.toString() }; 
        return res.status(201).json(response);
    });
    
    static azureTranscription = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const { audioUrl, language } = req.body;

        if (!audioUrl) {
            throw new AppError(400, "audioUrl is required");
        }

        if (!language) {
            throw new AppError(400, "language is required");
        }

        const record = await transciptionService.createTranscription(audioUrl, language, 'azure');
        
        if (!record) {
            throw new AppError(500, "Failed to create transcription");
        }
        
        const response: CreateTransactionResponse = { id: record._id.toString() }; 
        return res.status(201).json(response);
    });
    
    static getTranscriptions = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
        const records = await transciptionService.getTranscriptions();
        
        return res.status(200).json(records);
    });
}