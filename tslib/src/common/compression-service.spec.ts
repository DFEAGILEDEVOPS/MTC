import { CompressionService } from './compression-service'
import largeCheck from './mocks/large-submitted-check.json'

let sut: CompressionService

describe('compression-service', () => {
  beforeEach(() => {
    sut = new CompressionService()
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('utf-16', () => {
    test('should compress a string', () => {
      const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
      const output = sut.compressToUTF16(input)
      expect(output).toBeDefined()
      expect(output.length).toBeLessThan(input.length)
    })

    test('should preserve contents', () => {
      const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
      const output = sut.compressToUTF16(input)
      const decompressed = sut.decompressFromUTF16(output)
      expect(decompressed).toStrictEqual(input)
    })
  })

  describe('base64', () => {
    test('should compress a string', () => {
      const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
      const output = sut.compressToBase64(input)
      expect(output).toBeDefined()
      expect(output.length).toBeLessThan(input.length)
    })

    test('should preserve contents', () => {
      const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
      const output = sut.compressToBase64(input)
      const decompressed = sut.decompressFromBase64(output)
      expect(decompressed).toStrictEqual(input)
    })

    test('handles a large check payload', () => {
      const stringified = JSON.stringify(largeCheck)
      const compressed = sut.compressToBase64(stringified)
      expect(compressed).toBeDefined()
      const decompressed = sut.decompressFromBase64(compressed)
      expect(decompressed).toBeDefined()
      const parsed = JSON.parse(decompressed)
      expect(parsed).toStrictEqual(largeCheck)
    })
  })
})
