import { TranscriptionInput } from "../../types/transcription.types";
import { TranscriptionProvider } from "./transciption.provider";

export class BasicProvider implements TranscriptionProvider {
    async transcribe({audioUrl}: TranscriptionInput): Promise<string> {
        return `Transcription of audio at ${audioUrl} by BasicProvider`;
    }
}