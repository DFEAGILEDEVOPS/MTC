import { TestBed, inject } from '@angular/core/testing';

import { CompressorService } from './compressor.service';

describe('CompressorService', () => {

  it('should have a compress method', () => {
    expect(typeof(CompressorService.compress)).toBe('function');
  });

  it('should have a decompress method', () => {
    expect(typeof(CompressorService.decompress)).toBe('function');
  });

  it('the results of compressing and decompressing are equivalent to the input', () => {
    const input = 'this is a test string !@#$%^&*()';
    expect(CompressorService.decompress(CompressorService.compress(input))).toEqual(input);
  });

  describe('Compressor.compress', () => {
    it('returns a string', () => {
      const result = CompressorService.compress('test');
      expect(typeof(result)).toBe('string');
    });
  });

  describe('Compressor.decompress', () => {
    it('returns a string',  () => {
      const result = CompressorService.decompress('test');
      expect(typeof(result)).toBe('string');
    });
  });
});
