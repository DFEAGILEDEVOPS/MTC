import { CompressorService } from './compressor.service';

describe('CompressorService', () => {

  it('should have a compress method', () => {
    expect(typeof(CompressorService.compress)).toBe('function');
  });

  describe('Compressor.compress', () => {
    it('returns a string', () => {
      const result = CompressorService.compress('test');
      expect(typeof(result)).toBe('string');
    });
  });
});
