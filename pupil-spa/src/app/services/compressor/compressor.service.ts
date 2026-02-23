import { Injectable } from '@angular/core';
import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate';

@Injectable()
export class CompressorService {

  constructor() { }

  /**
   *
   * @param data stringified object to compress
   * @returns base64 encoded string after gzip compression
   */
  static compressToGzip(data: string): string {
    const comp = gzipSync(strToU8(data), { level: 8, mem: 8 })
    const b64 = btoa(strFromU8(comp, true))
    return b64
  }

  /**
   *
   * @param data base64 encoded gzip data
   * @returns an object (e.g. the payload)
   */
  static decompressFromGzip(b64Data: string): any {
    // reverse base64 encoding
    const comp = atob(b64Data)

    // decompress gzip
    const uncompData = gunzipSync(strToU8(comp, true))
    const uncomp = strFromU8(uncompData)

    const obj = JSON.parse(uncomp)
    return obj
  }
}
