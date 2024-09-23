import lzString from 'lz-string'
import { gzipSync, gunzipSync, strFromU8, strToU8 } from 'fflate'

export interface ICompressionService {
  compressToUTF16 (input: string): string
  decompressFromUTF16 (input: string): string
  compressToBase64 (input: string): string
  decompressFromBase64 (input: string): string
  compressToGzip (input: string): string
  decompressFromGzip (input: string): any
}

export class CompressionService implements ICompressionService {
  /**
   * Compress a string to utf16
   * @param {string} string
   * @return {*|string}
   */
  compressToUTF16 (input: string): string {
    return lzString.compressToUTF16(input)
  }

  /**
   * Decompress a string from utf 16
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompressFromUTF16 (input: string): any | string | (string | null | undefined) {
    return lzString.decompressFromUTF16(input)
  }

  /**
   * Compress a string to base64
   * @param {string}
   * @return {*|string}
   */
  compressToBase64 (input: string): string {
    return lzString.compressToBase64(input)
  }

  /**
   * Decompress a string from base64
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompressFromBase64 (input: string): any | string | (string | null | undefined) {
    return lzString.decompressFromBase64(input)
  }

  /**
   *
   * @param data stringified object to compress
   * @returns base64 encoded string after gzip compression
   */
  compressToGzip (data: string): string {
    const comp = gzipSync(strToU8(data), { level: 8, mem: 8 })
    const b64 = btoa(strFromU8(comp, true))
    return b64
  }

  /**
   *
   * @param data base64 encoded gzip data
   * @returns an object (e.g. the payload)
   */
  decompressFromGzip (b64Data: string): any {
    // reverse base64 encoding
    const comp = atob(b64Data)

    // decompress gzip
    const uncompData = gunzipSync(strToU8(comp, true))
    const uncomp = strFromU8(uncompData)

    const obj = JSON.parse(uncomp)
    return obj
  }
}

export default new CompressionService()
