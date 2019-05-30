import { Injectable } from '@angular/core';
import * as lzString from 'lz-string';

@Injectable()
export class CompressorService {

  constructor() { }

  static compress(data: String): string {
    return lzString.compressToUTF16(data);
  }

  static decompress(archiveData: String): string {
    return lzString.decompressFromUTF16(archiveData);
  }
}
