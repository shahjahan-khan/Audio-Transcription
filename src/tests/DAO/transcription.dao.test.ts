import TranscriptionDAO from '../../DAO/transcription.dao';
import { TranscriptionModel } from '../../models/transcription.model';
import { AppError } from '../../middleware/errorHandler';

describe('TranscriptionDAO', () => {
  let dao: TranscriptionDAO;

  beforeEach(() => {
    dao = new TranscriptionDAO();
  });

  describe('createTranscription', () => {
    it('should create a transcription record', async () => {
      const transcriptionObj = {
        audioUrl: 'https://example.com/audio.mp3',
        transcriptionText: 'Test transcription',
        language: 'en-us',
        source: 'basic',
      };

      const result = await dao.createTranscription(transcriptionObj);

      expect(result).toBeDefined();
      expect(result.audioUrl).toBe(transcriptionObj.audioUrl);
      expect(result.transcriptionText).toBe(transcriptionObj.transcriptionText);
      expect(result.createdAt).toBeDefined();
    });

    it('should throw AppError on validation failure', async () => {
      const invalidObj = {
        audioUrl: 'https://example.com/audio.mp3',
        // Missing required transcriptionText
      };

      await expect(dao.createTranscription(invalidObj)).rejects.toThrow(AppError);
    });

    it('should throw AppError on database error', async () => {
      jest.spyOn(TranscriptionModel, 'create').mockRejectedValueOnce(new Error('DB Error'));

      const transcriptionObj = {
        audioUrl: 'https://example.com/audio.mp3',
        transcriptionText: 'Test transcription',
      };

      await expect(dao.createTranscription(transcriptionObj)).rejects.toThrow(AppError);
    });
  });

  describe('getTranscriptions', () => {
    it('should return transcriptions from last 30 days', async () => {
      // Create some test records
      const now = new Date();
      const record1 = await TranscriptionModel.create({
        audioUrl: 'https://example.com/audio1.mp3',
        transcriptionText: 'Transcription 1',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      });

      const record2 = await TranscriptionModel.create({
        audioUrl: 'https://example.com/audio2.mp3',
        transcriptionText: 'Transcription 2',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      });

      const results = await dao.getTranscriptions();

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some((r: any) => r.audioUrl === record1.audioUrl)).toBe(true);
      expect(results.some((r: any) => r.audioUrl === record2.audioUrl)).toBe(true);
    });

    it('should not return transcriptions older than 30 days', async () => {
      const now = new Date();
      
      // Create a record older than 30 days
      await TranscriptionModel.create({
        audioUrl: 'https://example.com/old-audio.mp3',
        transcriptionText: 'Old transcription',
        createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      });

      // Create a recent record
      const recentRecord = await TranscriptionModel.create({
        audioUrl: 'https://example.com/recent-audio.mp3',
        transcriptionText: 'Recent transcription',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      });

      const results = await dao.getTranscriptions();

      expect(results.some((r: any) => r.audioUrl === 'https://example.com/old-audio.mp3')).toBe(false);
      expect(results.some((r: any) => r.audioUrl === recentRecord.audioUrl)).toBe(true);
    });

    it('should return empty array when no transcriptions exist', async () => {
      const results = await dao.getTranscriptions();

      expect(results).toEqual([]);
    });

    it('should throw AppError on database error', async () => {
      jest.spyOn(TranscriptionModel, 'find').mockImplementationOnce(() => {
        throw new Error('DB Error');
      });

      await expect(dao.getTranscriptions()).rejects.toThrow(AppError);
    });

    it('should return lean objects (plain JS)', async () => {
      await TranscriptionModel.create({
        audioUrl: 'https://example.com/audio.mp3',
        transcriptionText: 'Test',
      });

      const results = await dao.getTranscriptions();

      expect(results[0]).not.toHaveProperty('save');
      expect(results[0]).not.toHaveProperty('$isNew');
    });
  });
});
