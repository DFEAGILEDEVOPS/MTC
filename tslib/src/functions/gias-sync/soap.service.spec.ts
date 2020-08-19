import { SoapService, ISoapMessageSpecification } from './soap.service'
import { v4 as uuid } from 'uuid'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'
import { IDateTimeService } from '../../common/datetime.service'

let sut: SoapService
let dateTimeServiceMock: jest.Mock<IDateTimeService>

const xmlParserOptions = {
  attributeNamePrefix : '',
  attrNodeName: 'attr', // default is 'false'
  textNodeName : 'value',
  ignoreAttributes : false,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: '__cdata', // default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, // "strict"
  attrValueProcessor: (val: any, attrName: string) => he.decode(val, { isAttributeValue: true }),// default is a=>a
  tagValueProcessor : (val: any, tagName: string) => he.decode(val), // default is a=>a
  stopNodes: ['parse-me-as-string']
}

let namespace: string

describe('soap.service', () => {
  beforeEach(() => {
    sut = new SoapService()
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

  test('when message expiry specified a security header is included with expiry value', () => {
    const expiryValue = 1234
    const now = Date.now()
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
    expect(expiryDateTime).toBeDefined()
    const expectedExpiryDateTime = new Date(now + expiryValue)
    expect(expiryDateTime).toEqual(expectedExpiryDateTime.toISOString())
    console.log(expiryDateTime)
    console.dir(timestampElement)
  })
})
