import { TranscriptionInput } from "../../types/transcription.types";

export interface TranscriptionProvider {
    transcribe(input: TranscriptionInput): Promise<string>;
}