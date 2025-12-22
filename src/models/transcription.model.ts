import { Schema, model, Document } from 'mongoose';

export interface TranscriptionDocument extends Document {
    audioUrl: string;
    transcriptionText: string;
    createdAt: Date;
    source? : string;
}

const TranscriptionSchema = new Schema<TranscriptionDocument>({
    audioUrl: { type: String, required: true },
    transcriptionText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    source: { type: String, required: false }
});

TranscriptionSchema.index({ createdAt: -1 }); // -1 to get new record first

export const TranscriptionModel = model<TranscriptionDocument>('Transcription', TranscriptionSchema);