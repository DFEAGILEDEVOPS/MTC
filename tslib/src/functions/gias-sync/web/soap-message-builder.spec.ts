import { SoapMessageBuilder, ISoapMessageSpecification } from './soap-message-builder'
import { v4 as uuid } from 'uuid'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'
import { IDateTimeService } from '../../../common/datetime.service'
import moment from 'moment'

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(),
  formatIso8601: jest.fn(),
  convertDateToMoment: jest.fn(),
  convertMomentToJsDate: jest.fn()
}))

let sut: SoapMessageBuilder
let dateTimeServiceMock: IDateTimeService

const xmlParserOptions = {
  attributeNamePrefix: '',
  attrNodeName: 'attr', // default is 'false'
  textNodeName: 'value',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', // default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, // "strict"
  attrValueProcessor: (val: any) => he.decode(val, { isAttributeValue: true }), // default is a=>a
  tagValueProcessor: (val: any) => he.decode(val), // default is a=>a
  stopNodes: ['parse-me-as-string']
}

let namespace: string

describe('soap-message-builder', () => {
  beforeEach(() => {
    dateTimeServiceMock = new DateTimeServiceMock()
    sut = new SoapMessageBuilder(dateTimeServiceMock)
    namespace = uuid()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('returns an xml structure with namespace as specified', () => {
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      namespace: namespace,
      messageExpiryMs: 0
    }
    const receivedOutput = sut.buildMessage(messageSpec)
    expect(receivedOutput).toBeDefined()
    const xml = xmlParser.parse(receivedOutput, xmlParserOptions)
    expect(xml['soapenv:Envelope'].attr['xmlns:ws']).toEqual(namespace)
  })

  test('when credentials specified a security header is included containing credentials', () => {
    const username = 'foo'
    const password = 'bar'
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      namespace: namespace,
      messageExpiryMs: 0,
      credentials: {
        username: username,
        password: password
      }
    }
    const builderOutput = sut.buildMessage(messageSpec)
    expect(builderOutput).toBeDefined()
    const xml = xmlParser.parse(builderOutput, xmlParserOptions)
    const soapHeader = xml['soapenv:Envelope']['soapenv:Header']
    expect(soapHeader).toBeDefined()
    const securityElement = soapHeader['wsse:Security']
    expect(securityElement).toBeDefined()
    const usernameToken = securityElement['wsse:UsernameToken']
    expect(usernameToken['wsse:Username']).toEqual(username)
    expect(usernameToken['wsse:Password'].value).toEqual(password)
  })

  test('when message expiry specified security header details creation and expiry values', () => {
    const expiryValue = 1234
    const mockNow = moment()
    jest.spyOn(dateTimeServiceMock, 'utcNow').mockImplementation(() => mockNow)
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      namespace: namespace,
      messageExpiryMs: expiryValue
    }
    const builderOutput = sut.buildMessage(messageSpec)
    const xml = xmlParser.parse(builderOutput, xmlParserOptions)
    const soapHeader = xml['soapenv:Envelope']['soapenv:Header']
    expect(soapHeader).toBeDefined()
    const securityElement = soapHeader['wsse:Security']
    expect(securityElement).toBeDefined()
    const timestampElement = securityElement['wsu:Timestamp']
    expect(timestampElement).toBeDefined()
    const expiryDateTime = timestampElement['wsu:Expires']
    const createdDateTime = timestampElement['wsu:Created']
    expect(expiryDateTime).toBeDefined()
    expect(createdDateTime).toBeDefined()
    const expectedExpiryDateTime = mockNow.clone().add(expiryValue, 'milliseconds').toDate()
    expect(expiryDateTime).toStrictEqual(expectedExpiryDateTime.toISOString())
    expect(createdDateTime).toStrictEqual(mockNow.toISOString())
  })

  test('message should have a body defined', () => {
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      namespace: namespace,
      messageExpiryMs: 0
    }
    const builderOutput = sut.buildMessage(messageSpec)
    const xml = xmlParser.parse(builderOutput, xmlParserOptions)
    const soapBody = xml['soapenv:Envelope']['soapenv:Body']
    expect(soapBody['ws:action']).toBeDefined()
  })

  test('body should contain parameters when specified', () => {
    const paramValue = 1234
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      parameters: {
        Id: paramValue
      },
      namespace: namespace,
      messageExpiryMs: 0
    }
    const builderOutput = sut.buildMessage(messageSpec)
    const xml = xmlParser.parse(builderOutput, xmlParserOptions)
    const soapBody = xml['soapenv:Envelope']['soapenv:Body']
    const params = soapBody['ws:action']
    expect(params).toBeDefined()
    expect(params['ws:Id']).toStrictEqual(paramValue)
  })
})
