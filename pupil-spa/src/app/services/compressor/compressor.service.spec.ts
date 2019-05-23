import { TestBed, inject } from '@angular/core/testing';

import { CompressorService } from './compressor.service';

describe('CompressorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompressorService]
    });
  });

  it('should be created', inject([CompressorService], (service: CompressorService) => {
    expect(service).toBeTruthy();
  }));

  it('should have a compress method', inject([CompressorService], (service: CompressorService) => {
    expect(typeof(service.compress)).toBe('function');
  }));

  it('should have a decompress method', inject([CompressorService], (service: CompressorService) => {
    expect(typeof(service.decompress)).toBe('function');
  }));

  it('the results of compressing and decompressing are equivalent to the input',
    inject([CompressorService], (service: CompressorService) => {
    const input = 'this is a test string !@#$%^&*()';
    expect(service.decompress(service.compress(input))).toEqual(input);
  }));

  describe('Compressor.compress', () => {
    it('returns a string',  inject([CompressorService], (service: CompressorService) => {
      const result = service.compress('test');
      expect(typeof(result)).toBe('string');
    }));
  });

  describe('Compressor.decompress', () => {
    it('returns a string',  inject([CompressorService], (service: CompressorService) => {
      const result = service.decompress('test');
      expect(typeof(result)).toBe('string');
    }));
  });
});
