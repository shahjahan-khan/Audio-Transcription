import { AzureProvider } from '../../services/providers/azure.provider';

describe('AzureProvider', () => {
  let provider: AzureProvider;

  beforeEach(() => {
    provider = new AzureProvider();
  });

  describe('transcribe', () => {
    it('should return transcription text with audioUrl and language', async () => {
      const input = {
        audioUrl: 'https://example.com/audio.mp3',
        language: 'en-US',
      };

      const result = await provider.transcribe(input);

      expect(result).toBeDefined();
      expect(result).toContain('https://example.com/audio.mp3');
      expect(result).toContain('en-US');
      expect(result).toContain('AzureProvider');
    });

    it('should use default language when not provided', async () => {
      const input = {
        audioUrl: 'https://example.com/audio.mp3',
      };

      const result = await provider.transcribe(input);

      expect(result).toContain('en-us');
    });

    it('should handle different languages', async () => {
      const inputEnglish = {
        audioUrl: 'https://example.com/audio.mp3',
        language: 'en-US',
      };
      const inputSpanish = {
        audioUrl: 'https://example.com/audio.mp3',
        language: 'es-ES',
      };

      const resultEnglish = await provider.transcribe(inputEnglish);
      const resultSpanish = await provider.transcribe(inputSpanish);

      expect(resultEnglish).toContain('en-US');
      expect(resultSpanish).toContain('es-ES');
      expect(resultEnglish).not.toEqual(resultSpanish);
    });

    it('should return a string', async () => {
      const input = {
        audioUrl: 'https://example.com/audio.mp3',
        language: 'fr-FR',
      };

      const result = await provider.transcribe(input);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
