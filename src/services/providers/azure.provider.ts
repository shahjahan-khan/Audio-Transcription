import { TranscriptionInput } from "../../types/transcription.types";
import { TranscriptionProvider } from "./transciption.provider";

export class AzureProvider implements TranscriptionProvider {
    async transcribe({audioUrl, language = 'en-us'}: TranscriptionInput): Promise<string> {
        // Mock implementation for Azure transcription
        return `Transcription of audio at ${audioUrl} in language ${language} by AzureProvider`;
    }
}