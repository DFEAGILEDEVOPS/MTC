import { CompressionService } from './compression-service'
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
  })
})
