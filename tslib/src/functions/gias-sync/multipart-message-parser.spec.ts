import { MultipartMessageParser, IResponse } from './multipart-message-parser'

/*
From: Some One <someone@example.com>
MIME-Version: 1.0
Content-Type: multipart/mixed;
        boundary="XXXXboundary text"

This is a multipart message in MIME format.

--XXXXboundary text
Content-Type: text/plain

this is the body text

--XXXXboundary text
Content-Type: text/plain;
Content-Disposition: attachment;
        filename="test.txt"

this is the attachment text

--XXXXboundary text--
*/

/*
POST / HTTP/1.1
HOST: host.example.com
Cookie: some_cookies...
Connection: Keep-Alive
Content-Type: multipart/mixed; boundary=12345

--12345
Content-Disposition: text/plain;

Hello,

--12345
Content-Disposition: text/plain;
How...

--12345
Content-Disposition: text/plain;

...are you?
--12345--
*/

let sut: MultipartMessageParser

describe('multipart message parser', () => {
  beforeEach(() => {
    sut = new MultipartMessageParser()
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error thrown if content-type not found', () => {
    try {
      const response: IResponse = {
        body: {},
        headers: {
          'accept': 'text/xml'
        },
        statusCode: 200
      }
      sut.parse(response)
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
      sut.parse(response)
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
      sut.parse(response)
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
