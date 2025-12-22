import TranscriptionDAO from "./DAO/transcription.dao";
import { AzureProvider } from "./services/providers/azure.provider";
import { BasicProvider } from "./services/providers/basic.provider";
import TranscriptionService from "./services/transcription.service";

const dao =  new TranscriptionDAO();

const provider = {
    basic: new BasicProvider(),
    azure: new AzureProvider()
}

export const transciptionService = new TranscriptionService(dao, provider);