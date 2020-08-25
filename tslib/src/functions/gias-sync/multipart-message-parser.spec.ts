import { MultipartMessage, MultipartMessagePart } from './multipart-message-parser'

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

let sut: MultipartMessage

describe('multipart message parser', () => {
  beforeEach(() => {
    let parts = new Array<MultipartMessagePart>()
    sut = new MultipartMessage(parts)
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })
})
