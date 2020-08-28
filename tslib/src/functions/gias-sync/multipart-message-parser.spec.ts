import { MultipartMessageParser, IResponse } from './multipart-message-parser'
import { v4 as uuid } from 'uuid'
import { GiasService } from './gias.service'
import { XmlParser } from './xml-parser'
import { ReadableStream } from 'memory-streams'
import * as unzip from 'unzipper'

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
            'accept': 'text/xml'
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

  describe('parse', () => {
    test.skip('returns parts array', () => {
      const boundaryId = uuid()
      // body: `--${boundaryId}\r\nContent-Type: application/xop+xml; charset=utf-8; type=\"text/xml\"\r\n\r\n<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\"><SOAP-ENV:Header>\r\n</SOAP-ENV:Header><SOAP-ENV:Body><ns2:GetExtractResponse xmlns:ns2=\"http:/mtc.com\" xmlns:ns3=\"http://mtc.com/DataTypes\" xmlns:ns4=\"http://mtc.com/Establishment\"><ns2:Extract><xop:Include xmlns:xop=\"http://www.w3.org/2004/08/xop/include\" href=\"cid:41d57290-f016-4066-8dc0-9dfa5ad78663%40mtc.com\"/></ns2:Extract></ns2:GetExtractResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>\r\n--${boundaryId}\r\nContent-Type: application/octet-stream\r\nContent-ID: <41d57290-f016-4066-8dc0-9dfa5ad78663@mtc.com>\r\n--${boundaryId}`,
      const response: IResponse = {
        body: `--${boundaryId}
        Content-Disposition: text/plain;

        Hello,

        --${boundaryId}
        Content-Disposition: text/plain;
        How...

        --${boundaryId}
        Content-Disposition: text/plain;

        ...are you?
        --${boundaryId}--`,
        headers: {
          'content-type': `Multipart/Related; boundary=\"${boundaryId}\"; type=\"text/plan\"; start-info=\"text/plain\"`
        },
        statusCode: 200
      }
      const actual = sut.parse(response)
      expect(actual.length).toBe(3)
    })

    test('e2e issue', async () => {
      const gias = new GiasService()
      const soapResponse = await gias.GetExtract(process.env.GIAS_WS_EXTRACT_ID || '')
      let parts = sut.parse(soapResponse)
      expect(parts).toBeDefined()
      parts.splice(0, 2)
      const parser = new XmlParser()
      const parsedXml = parser.parse(parts[0].content.toString())
      expect(parsedXml).toBeDefined()
      const attachmentId = parsedXml.Envelope.Body.GetExtractResponse.Extract.Include.attr.href.substr(4).replace('%40', '@')
      console.log(`attachmentId:${attachmentId}`)
      const attachment = parts.find(x => x.id === attachmentId)
      expect(attachment).toBeDefined()
      if (attachment === undefined) return
      const p = new Promise((resolve, reject) => {
        const input = new ReadableStream(attachment.content.toString())
        const files = new Array<any>()
        input
          .pipe(unzip.Parse())
          .on('entry', (entry) => {
            entry.buffer().then((content: any) => {
              files.push({
                name: entry.path,
                content
              })
            })
            /* if (attachmentNames.find(x => x === entry.path)) {
              entry.buffer().then((content) => {
                files.push({
                  name: entry.path,
                  content,
                })
              })
            } else {
              entry.autodrain()
            } */
          })
          .on('error', (e) => {
            reject(e)
          })
          .on('finish', () => {
            resolve(files)
          })
      })
      await p
    })
  })
})
