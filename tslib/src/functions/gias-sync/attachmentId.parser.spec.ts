import { AttachmentIdParser } from './attachmentId.parser'

let sut: AttachmentIdParser

const attachmentId = 'extract.xml'
let mockExtractStructure: any

describe('attachmentId parser', () => {
  beforeEach(() => {
    sut = new AttachmentIdParser()
    mockExtractStructure = {
      Envelope: {
        Body: {
          GetExtractResponse: {
            Extract: {
              Include: {
                attr: {
                  href: `cid:${attachmentId}`
                }
              }
            }
          }
        }
      }
    }
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error is thrown when argument not provided', () => {
    try {
      sut.parse(undefined)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe('extract data is required')
    }
  })

  test('error is thrown when extract data not found', () => {
    try {
      delete mockExtractStructure.Envelope.Body
      sut.parse(mockExtractStructure)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe('expected extract structure not found')
    }
  })

  test('attachment id is returned when found', () => {
    const actual = sut.parse(mockExtractStructure)
    expect(actual).toEqual(attachmentId)
  })

  test('html encoded @ char is decoded before return', () => {
    const idPrefix = 'cid:xyz%40'
    mockExtractStructure.Envelope.Body.GetExtractResponse.Extract.Include.attr.href = `${idPrefix}${attachmentId}`
    const actual = sut.parse(mockExtractStructure)
    expect(actual).toEqual(`xyz@${attachmentId}`)
  })
})
