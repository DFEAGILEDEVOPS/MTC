import { MultipartMessageParser, IResponse } from './multipart-message-parser'

let sut: MultipartMessageParser

describe('multipart message parser', () => {
  beforeEach(() => {
    sut = new MultipartMessageParser()
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('extractBoundaryIdFrom', () => {
    test('error thrown if content-type not found', () => {
      try {
        const response: IResponse = {
          body: {},
          headers: {
            accept: 'text/xml'
          },
          statusCode: 200
        }
        sut.extractBoundaryIdFrom(response)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('content-type header not found on response')
      }
    })

    test('throw error if response not multipart message', () => {
      try {
        const response: IResponse = {
          body: {},
          headers: {
            'content-type': 'text/xml'
          },
          statusCode: 200
        }
        sut.extractBoundaryIdFrom(response)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('response is not a multipart message')
      }
    })

    test('throw error if boundary id not defined', () => {
      try {
        const response: IResponse = {
          body: {},
          headers: {
            'content-type': 'Multipart/Related; type="text/xml"'
          },
          statusCode: 200
        }
        sut.extractBoundaryIdFrom(response)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('boundary id not defined')
      }
    })

    test('boundary id is extracted when present in header', () => {
      const boundaryId = 'xyz123abc'
      const response: IResponse = {
        body: {},
        headers: {
          'content-type': `Multipart/Related; boundary="${boundaryId}";type="text/xml"`
        },
        statusCode: 200
      }
      const extracted = sut.extractBoundaryIdFrom(response)
      expect(extracted).toEqual(boundaryId)
    })
  })
})
