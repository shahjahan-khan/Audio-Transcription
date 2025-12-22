import TranscriptionService from '../../services/transcription.service';
import TranscriptionDAO from '../../DAO/transcription.dao';
import { BasicProvider } from '../../services/providers/basic.provider';
import { AzureProvider } from '../../services/providers/azure.provider';
import { AppError } from '../../middleware/errorHandler';

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let mockDAO: jest.Mocked<TranscriptionDAO>;
  let mockBasicProvider: jest.Mocked<BasicProvider>;
  let mockAzureProvider: jest.Mocked<AzureProvider>;

  beforeEach(() => {
    mockDAO = {
      createTranscription: jest.fn(),
      getTranscriptions: jest.fn(),
    } as any;

    mockBasicProvider = {
      transcribe: jest.fn(),
    } as any;

    mockAzureProvider = {
      transcribe: jest.fn(),
    } as any;

    const providers = {
      basic: mockBasicProvider,
      azure: mockAzureProvider,
    };

    service = new TranscriptionService(mockDAO, providers);
  });

  describe('createTranscription', () => {
    it('should create transcription with basic provider', async () => {
      const audioUrl = 'https://example.com/audio.mp3';
      const language = 'en-us';
      const transcriptionText = 'Transcription text';
      const mockRecord = {
        _id: '507f1f77bcf86cd799439011',
        audioUrl,
        transcriptionText,
        language,
        source: 'basic',
      };

      mockBasicProvider.transcribe.mockResolvedValue(transcriptionText);
      mockDAO.createTranscription.mockResolvedValue(mockRecord as any);

      const result = await service.createTranscription(audioUrl, language);

      expect(mockBasicProvider.transcribe).toHaveBeenCalledWith({ audioUrl, language });
      expect(mockDAO.createTranscription).toHaveBeenCalledWith({
        audioUrl,
        transcriptionText,
        language,
        source: 'basic',
      });
      expect(result).toEqual(mockRecord);
    });

    it('should create transcription with azure provider', async () => {
      const audioUrl = 'https://example.com/audio.mp3';
      const language = 'en-US';
      const transcriptionText = 'Azure transcription';
      const mockRecord = {
        _id: '507f1f77bcf86cd799439011',
        audioUrl,
        transcriptionText,
        language,
        source: 'azure',
      };

      mockAzureProvider.transcribe.mockResolvedValue(transcriptionText);
      mockDAO.createTranscription.mockResolvedValue(mockRecord as any);

      const result = await service.createTranscription(audioUrl, language, 'azure');

      expect(mockAzureProvider.transcribe).toHaveBeenCalledWith({ audioUrl, language });
      expect(mockDAO.createTranscription).toHaveBeenCalledWith({
        audioUrl,
        transcriptionText,
        language,
        source: 'azure',
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw error when audioUrl is missing', async () => {
      await expect(service.createTranscription('', 'en-us')).rejects.toThrow(AppError);
      expect(mockDAO.createTranscription).not.toHaveBeenCalled();
    });

    it('should throw error for invalid provider', async () => {
      await expect(
        service.createTranscription('https://example.com/audio.mp3', 'en-us', 'invalid')
      ).rejects.toThrow(AppError);
    });

    it('should throw error when transcription fails', async () => {
      mockBasicProvider.transcribe.mockResolvedValue('');

      await expect(
        service.createTranscription('https://example.com/audio.mp3', 'en-us')
      ).rejects.toThrow(AppError);
    });

    it('should handle DAO errors gracefully', async () => {
      mockBasicProvider.transcribe.mockResolvedValue('Transcription text');
      mockDAO.createTranscription.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createTranscription('https://example.com/audio.mp3', 'en-us')
      ).rejects.toThrow(AppError);
    });
  });

  describe('getTranscriptions', () => {
    it('should return all transcriptions', async () => {
      const mockRecords = [
        {
          _id: '507f1f77bcf86cd799439011',
          audioUrl: 'https://example.com/audio1.mp3',
          transcriptionText: 'Transcription 1',
          createdAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          audioUrl: 'https://example.com/audio2.mp3',
          transcriptionText: 'Transcription 2',
          createdAt: new Date(),
        },
      ];

      mockDAO.getTranscriptions.mockResolvedValue(mockRecords as any);

      const result = await service.getTranscriptions();

      expect(mockDAO.getTranscriptions).toHaveBeenCalled();
      expect(result).toEqual(mockRecords);
    });

    it('should return empty array when no transcriptions exist', async () => {
      mockDAO.getTranscriptions.mockResolvedValue([]);

      const result = await service.getTranscriptions();

      expect(result).toEqual([]);
    });

    it('should throw error when DAO fails', async () => {
      mockDAO.getTranscriptions.mockRejectedValue(new Error('Database error'));

      await expect(service.getTranscriptions()).rejects.toThrow(AppError);
    });
  });
});
