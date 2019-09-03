
import lzString from 'lz-string'

const moduleToExport = {
  /**
   * Compress a string
   * @param {string} string
   * @return {*|string}
   */
  compress: function compress (input: string): any | string {
    return lzString.compressToUTF16(input)
  },

  /**
   * Decompress a string
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompress: function decompress (input: string): any | string | (string | null | undefined) {
    return lzString.decompressFromUTF16(input)
  }
}

export default moduleToExport
