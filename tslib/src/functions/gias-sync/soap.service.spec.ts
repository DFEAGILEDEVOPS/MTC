import { SoapService, ISoapMessageSpecification } from './soap.service'
import { v4 as uuid } from 'uuid'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'

let sut: SoapService

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
    const receivedOutput = sut.buildMessage(messageSpec)
    expect(receivedOutput).toBeDefined()
    const xml = xmlParser.parse(receivedOutput, xmlParserOptions)
    const soapHeader = xml['soapenv:Envelope']['soapenv:Header']
    expect(soapHeader).toBeDefined()
    const securityElement = soapHeader['wsse:Security']
    console.dir(securityElement)
    expect(securityElement).toBeDefined()
    const usernameToken = securityElement['wsse:UsernameToken']
    expect(usernameToken['wsse:Username']).toEqual(username)
    expect(usernameToken['wsse:Password'].value).toEqual(password)
  })
})
