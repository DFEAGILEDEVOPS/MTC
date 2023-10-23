import { CompressionService } from './compression-service'
let sut: CompressionService

describe('compression-service', () => {
  beforeEach(() => {
    sut = new CompressionService()
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('should compress a string', () => {
    const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
    const output = sut.compressToUTF16(input)
    expect(output).toBeDefined()
    expect(output.length).toBeLessThan(input.length)
  })
})
