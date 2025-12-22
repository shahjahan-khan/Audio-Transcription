import { Router } from 'express';
import TranscriptionController from '../controllers/transcription.controller';

const router = Router();

router.get('/test', (req, res) => {
    console.log(' inside router', req)
    res.send('Router is working!');
});

router.post('/transcribe', TranscriptionController.createTranscription);
router.get('/transcribe', TranscriptionController.getTranscriptions);
router.post('/azure-transcribe', TranscriptionController.azureTranscription);

export default router;