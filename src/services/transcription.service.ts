import TranscriptionDAO from "../DAO/transcription.dao";
import { TranscriptionProvider } from "./providers/transciption.provider";
import { AppError } from "../middleware/errorHandler";

export default class TranscriptionService {

    constructor(
        private dao: TranscriptionDAO,
        private providers: Record<string, TranscriptionProvider>
    ) {}

    async createTranscription(audioUrl: string, language: string, provider: string = 'basic') {
        try {
            if (!audioUrl) {
                throw new AppError(400, "audioUrl is required");
            }

            if (!this.providers[provider]) {
                throw new AppError(400, `Invalid provider: ${provider}`);
            }

            await this.mockDownloadAudio(audioUrl);

            const transcriptionText = await this.providers[provider].transcribe({ audioUrl, language });

            if (!transcriptionText) {
                throw new AppError(500, "Transcription failed");
            }

            const Response = await this.dao.createTranscription({ audioUrl, transcriptionText, language, source: provider });

            return Response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error in createTranscription:', error);
            throw new AppError(500, "Failed to create transcription");
        }
    }
    
    async getTranscriptions() {
        try {
            const Response = await this.dao.getTranscriptions();
            return Response;
        } catch (error) {
            console.error('Error in getTranscriptions:', error);
            throw new AppError(500, "Failed to retrieve transcriptions");
        }
    }2

    private  async mockDownloadAudio(audioUrl: string): Promise<void> {
        return new Promise((resolve) => {
            console.log(`Mock downloading audio from ${audioUrl}...`);
            setTimeout(() => {
                resolve()
            }, 1000);
        });
    }
}