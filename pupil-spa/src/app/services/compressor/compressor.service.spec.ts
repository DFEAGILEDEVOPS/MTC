import { CompressorService } from './compressor.service';

describe('CompressorService', () => {
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
