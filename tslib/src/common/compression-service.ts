import lzString from 'lz-string'

export interface ICompressionService {
  compressToUTF16 (input: string): string
  decompressFromUTF16 (input: string): string
  compressToBase64 (input: string): string
  decompressFromBase64 (input: string): string
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
    console.log(`compressing input: ${input.substring(0, 30)}...`)
    const output = lzString.compressToBase64(input)
    console.log(`output: ${output}`)
    return output
  }

  /**
   * Decompress a string from base64
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompressFromBase64 (input: string): any | string | (string | null | undefined) {
    return lzString.decompressFromBase64(input)
  }
}

export default new CompressionService()
