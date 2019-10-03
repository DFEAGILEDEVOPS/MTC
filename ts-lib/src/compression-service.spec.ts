import { CompressionService } from './compression-service'
let sut: CompressionService

describe('compression-service', () => {
  beforeEach(() => {
    sut = new CompressionService()
  })
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })
  it('should compress a string', () => {
    const input = 'ALSDJFLSDKJFDSKJFSKDLJFSKJFSKLJFSDFJLKSDFJ'
    const output = sut.compress(input)
    expect(output).toBeDefined()
    expect(output.length).toBeLessThan(input.length)
  })
})
