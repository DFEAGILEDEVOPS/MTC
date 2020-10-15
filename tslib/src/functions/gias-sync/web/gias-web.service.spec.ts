import { GiasWebService } from './gias-web.service'
import { ISoapMessageBuilder, ISoapMessageSpecification } from './soap-message-builder'
import { v4 as uuid } from 'uuid'
import { ISoapRequestService } from './soap-request.service'
import config from '../../../config'
import { IXmlParser } from '../xml-parser'
import { IMultipartMessageParser, IMessagePart } from './multipart-message-parser'
import { IZipService } from '../zip.service'

const SoapMessageBuilderMock = jest.fn<ISoapMessageBuilder, any>(() => ({
  buildMessage: jest.fn()
}))
const SoapRequestServiceMock = jest.fn<ISoapRequestService, any>(() => ({
  execute: jest.fn()
}))
const XmlParserMock = jest.fn<IXmlParser, any>(() => ({
  parse: jest.fn()
}))

const MultipartMessageParserMock = jest.fn<IMultipartMessageParser, any>(() => ({
  extractBoundaryIdFrom: jest.fn(),
  parse: jest.fn()
}))

const ZipServiceMock = jest.fn<IZipService, any>(() => ({
  extractEntriesFromZipBuffer: jest.fn()
}))

let sut: GiasWebService
let soapMessageBuilderMock: ISoapMessageBuilder
let soapRequestServiceMock: ISoapRequestService
let xmlParserMock: IXmlParser
let multipartMessageParserMock: IMultipartMessageParser
let zipServiceMock: IZipService

const extractId = 1234

describe('GiasWebService', () => {
  beforeEach(() => {
    config.Gias.Namespace = 'gias.ns'
    config.Gias.ServiceUrl = 'gias.url'
    config.Gias.Username = 'foo'
    config.Gias.Password = 'bar'
    soapMessageBuilderMock = new SoapMessageBuilderMock()
    soapRequestServiceMock = new SoapRequestServiceMock()
    zipServiceMock = new ZipServiceMock()

    jest.spyOn(soapRequestServiceMock, 'execute').mockImplementation(async () => {
      const soapXml = {
        body: ''
      }
      return Promise.resolve(soapXml)
    })
    const extractHrefValue = 'cid:9cd380a3-db54-46f7-98db-8f65a269bbd4%40myfile.com'
    const attachmentPartId = extractHrefValue.substr(4).replace('%40', '@')
    xmlParserMock = new XmlParserMock()
    jest.spyOn(xmlParserMock, 'parse').mockImplementation(() => {
      return {
        Envelope: {
          Body: {
            GetExtractResponse: {
              Extract: {
                Include: {
                  attr: {
                    href: extractHrefValue
                  }
                }
              }
            }
          }
        }
      }
    })
    multipartMessageParserMock = new MultipartMessageParserMock()
    jest.spyOn(multipartMessageParserMock, 'extractBoundaryIdFrom').mockImplementation(() => 'boundaryId')
    jest.spyOn(multipartMessageParserMock, 'parse').mockImplementation(() => {
      const parts = new Array<IMessagePart>()
      parts.push({
        content: 'content',
        contentType: 'text/xml'
      })
      parts.push({
        id: attachmentPartId,
        content: 'content',
        contentType: 'type'
      })
      return parts
    })

    jest.spyOn(zipServiceMock, 'extractEntriesFromZipBuffer').mockImplementation(() => {
      const entries = new Array<Buffer>()
      entries.push(Buffer.from('foo'))
      return entries
    })

    sut = new GiasWebService(
      soapMessageBuilderMock,
      soapRequestServiceMock,
      xmlParserMock,
      multipartMessageParserMock,
      zipServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('GetExtract:should propogate original error details when a fault occurs', async () => {
    const errorInfo = `errorId:${uuid()}`
    try {
      jest.spyOn(soapMessageBuilderMock, 'buildMessage').mockImplementation(() => { throw new Error(errorInfo) })
      await sut.getExtract(extractId)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual(errorInfo)
    }
  })

  test('GetExtract: soapMessage should reflect extract specification', async () => {
    let capturedSpecification: ISoapMessageSpecification = {
      action: '',
      messageExpiryMs: 0,
      namespace: ''
    }
    jest.spyOn(soapMessageBuilderMock, 'buildMessage').mockImplementation((messageSpec) => {
      capturedSpecification = messageSpec
      return ''
    })
    await sut.getExtract(extractId)
    expect(capturedSpecification).toBeDefined()
    expect(capturedSpecification.action).toStrictEqual('GetExtract')
    expect(capturedSpecification.parameters).toBeDefined()
    expect(capturedSpecification.parameters.Id).toStrictEqual(extractId)
  })

  test('when namespace is not defined an error is thrown', async () => {
    try {
      config.Gias.Namespace = undefined
      await sut.getExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias web service namespace is required')
    }
  })

  test('when serviceUrl is not defined an error is thrown', async () => {
    try {
      config.Gias.ServiceUrl = undefined
      await sut.getExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias service url is required')
    }
  })

  test('when username is not defined an error is thrown', async () => {
    try {
      config.Gias.Username = undefined
      await sut.getExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias username is required')
    }
  })

  test('when password is not defined an error is thrown', async () => {
    try {
      config.Gias.Password = undefined
      await sut.getExtract(extractId)
      fail('error was expected to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual('gias password is required')
    }
  })
})
