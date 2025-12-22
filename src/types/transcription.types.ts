export interface CreateTransactionRequest {
    audioUrl: string;
}

export interface CreateTransactionResponse {
    id: string;
}

export interface TranscriptionInput {
    audioUrl: string;
    language?: string;
}