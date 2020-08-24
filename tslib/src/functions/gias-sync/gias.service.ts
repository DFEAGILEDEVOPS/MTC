import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'
import config from '../../config'
import { ISoapRequestService, SoapRequestService } from './soap-request.service'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'

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

export class GiasService {
  private soapMessageBuilder: ISoapMessageBuilder
  private soapRequestService: ISoapRequestService

  constructor (soapMessageBuilder?: ISoapMessageBuilder, soapRequestService?: ISoapRequestService) {
    if (soapMessageBuilder === undefined) {
      soapMessageBuilder = new SoapMessageBuilder()
    }
    this.soapMessageBuilder = soapMessageBuilder
    if (soapRequestService === undefined) {
      soapRequestService = new SoapRequestService()
    }
    this.soapRequestService = soapRequestService
  }

  async GetExtract (extractId: string): Promise<IExtractResult> {
    if (config.Gias.Namespace === undefined) {
      throw new Error('gias web service namespace is required')
    }
    if (config.Gias.ServiceUrl === undefined) {
      throw new Error('gias service url is required')
    }
    if (config.Gias.Username === undefined) {
      throw new Error('gias username is required')
    }
    if (config.Gias.Password === undefined) {
      throw new Error('gias password is required')
    }
    const wsActionId = 'GetExtract'
    const messageXml = this.soapMessageBuilder.buildMessage({
      action: wsActionId,
      messageExpiryMs: config.Gias.MessageExpiryInMilliseconds,
      namespace: config.Gias.Namespace,
      parameters: {
        Id: extractId
      },
      credentials: {
        username: config.Gias.Username,
        password: config.Gias.Password
      }
    })
    const response = await this.soapRequestService.execute({
      action: wsActionId,
      namespace: config.Gias.Namespace,
      serviceUrl: config.Gias.ServiceUrl,
      soapXml: messageXml,
      timeout: config.Gias.RequestTimeoutInMilliseconds
    })
    return {
      extractId: extractId,
      data: response
    }
  }

  async GetEstablishment (urn: number): Promise<any> {
    if (config.Gias.Namespace === undefined) {
      throw new Error('gias web service namespace is required')
    }
    if (config.Gias.ServiceUrl === undefined) {
      throw new Error('gias service url is required')
    }
    if (config.Gias.Username === undefined) {
      throw new Error('gias username is required')
    }
    if (config.Gias.Password === undefined) {
      throw new Error('gias password is required')
    }
    const wsActionId = 'GetEstablishment'
    const messageXml = this.soapMessageBuilder.buildMessage({
      action: wsActionId,
      messageExpiryMs: config.Gias.MessageExpiryInMilliseconds,
      namespace: config.Gias.Namespace,
      parameters: {
        Urn: urn
      },
      credentials: {
        username: config.Gias.Username,
        password: config.Gias.Password
      }
    })
    const xmlResponse = await this.soapRequestService.execute({
      action: wsActionId,
      namespace: config.Gias.Namespace,
      serviceUrl: config.Gias.ServiceUrl,
      soapXml: messageXml,
      timeout: config.Gias.RequestTimeoutInMilliseconds
    })
    console.dir(xmlResponse)
    return xmlParser.parse(xmlResponse, xmlParserOptions)
  }
}

export interface IExtractResult {
  extractId: string,
  data: any
}
