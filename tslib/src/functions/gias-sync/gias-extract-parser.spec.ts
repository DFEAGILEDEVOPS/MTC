import { GiasExtractParser } from './gias-extract-parser'
import { readFileSync } from 'fs'

let sut: GiasExtractParser
let mockExtractXml: string

describe('gias extract parser', () => {
  beforeAll(() => {
    mockExtractXml = readFileSync('./src/functions/gias-sync/mocks/mock-extract-small.xml').toString('utf8')
  })

  beforeEach(() => {
    sut = new GiasExtractParser()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('raw xml should be returned as object', () => {
    const actual = sut.parse(mockExtractXml)
    expect(actual).toBeDefined()
    expect(typeof actual).toEqual('object')
  })

  test('all establishments should be returned as array', () => {
    const actual = sut.parse(mockExtractXml)
    expect(actual).toBeDefined()
    expect(actual).toHaveLength(2)
  })
})
