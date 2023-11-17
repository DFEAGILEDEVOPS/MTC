import { Injectable } from '@angular/core';
import * as lzString from 'lz-string';

@Injectable()
export class CompressorService {

  constructor() { }

  static compress(data: string): string {
    return lzString.compressToUTF16(data);
  }

  static compressToBase64(data: string): string {
    return lzString.compressToBase64(data);
  }
}
