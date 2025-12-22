import { TranscriptionModel } from "../models/transcription.model";
import { AppError } from "../middleware/errorHandler";

export default class TranscriptionDAO {
    async createTranscription(transcriptionObj: object) {
        try {
            const record = await TranscriptionModel.create(transcriptionObj);
            return record;
        } catch (error) {
            console.error('Error creating transcription in DB:', error);
            throw new AppError(500, "Database error: Failed to create transcription");
        }
    }
    
    async getTranscriptions() {
        try {
            const record = await TranscriptionModel.find({
                createdAt: { $gte: new Date(Date.now() - 30*24*60*60 * 1000) }
            }).lean();
            return record;
        } catch (error) {
            console.error('Error fetching transcriptions from DB:', error);
            throw new AppError(500, "Database error: Failed to retrieve transcriptions");
        }
    }
}