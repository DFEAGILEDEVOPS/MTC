import { Injectable } from '@angular/core';
import * as lzString from 'lz-string';

@Injectable()
export class CompressorService {

  constructor() { }

  static compress(data: String): string {
    return lzString.compress(data);
  }

  static decompress(archiveData: String): string {
    return lzString.decompress(archiveData);
  }
}
