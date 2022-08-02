import { Injectable } from '@angular/core';
import * as lzString from 'lz-string';

@Injectable()
export class CompressorService {

  constructor() { }

  static compress(data: string): string {
    return lzString.compressToUTF16(data);
  }

  static decompress(archiveData: string): string {
    return lzString.decompressFromUTF16(archiveData);
  }
}
