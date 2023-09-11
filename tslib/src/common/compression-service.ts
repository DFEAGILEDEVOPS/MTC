import lzString from 'lz-string'

export interface ICompressionService {
  compress (input: string): string
  decompress (input: string): any | string | (string | null | undefined)
}

export class CompressionService implements ICompressionService {
  /**
   * Compress a string
   * @param {string} string
   * @return {*|string}
   */
  compress (input: string): string {
    return lzString.compressToUTF16(input)
  }

  /**
   * Decompress a string
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompress (input: string): any | string | (string | null | undefined) {
    return lzString.decompressFromUTF16(input)
  }
}

export default new CompressionService()
