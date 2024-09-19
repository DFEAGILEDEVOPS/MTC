import { CompressorService } from './compressor.service';
import { strFromU8, strToU8, gunzipSync } from 'fflate';

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

  describe('gzip compression', () => {
    const obj = {
      one: [1, 2, 3],
      two: {
        subOne: { this: 'that' },
        subTwo: { foo: 99.99, bar: 42 },
        flag: false
      }
    }
    it('compressToGzip works', () => {
      const b64Comp = CompressorService.compressToGzip(JSON.stringify(obj))
      const decomp = CompressorService.decompressFromGzip(b64Comp)
      expect(decomp).toEqual(obj)
    })
  })
});
