import { BasicProvider } from '../../services/providers/basic.provider';

describe('BasicProvider', () => {
  let provider: BasicProvider;

  beforeEach(() => {
    provider = new BasicProvider();
  });

  describe('transcribe', () => {
    it('should return transcription text with audioUrl', async () => {
      const input = {
        audioUrl: 'https://example.com/audio.mp3',
        language: 'en-us',
      };

      const result = await provider.transcribe(input);

      expect(result).toBeDefined();
      expect(result).toContain('https://example.com/audio.mp3');
      expect(result).toContain('BasicProvider');
    });

    it('should handle different audio URLs', async () => {
      const input1 = { audioUrl: 'https://example.com/audio1.mp3' };
      const input2 = { audioUrl: 'https://example.com/audio2.mp3' };

      const result1 = await provider.transcribe(input1);
      const result2 = await provider.transcribe(input2);

      expect(result1).not.toEqual(result2);
      expect(result1).toContain('audio1.mp3');
      expect(result2).toContain('audio2.mp3');
    });

    it('should return a string', async () => {
      const input = { audioUrl: 'https://example.com/audio.mp3' };

      const result = await provider.transcribe(input);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
