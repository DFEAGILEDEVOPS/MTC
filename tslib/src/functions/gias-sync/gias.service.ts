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
  ignoreNameSpace : true,
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

  private async makeRequest (actionId: string, params: any) {
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
    const messageXml = this.soapMessageBuilder.buildMessage({
      action: actionId,
      messageExpiryMs: config.Gias.MessageExpiryInMilliseconds,
      namespace: config.Gias.Namespace,
      parameters: params,
      credentials: {
        username: config.Gias.Username,
        password: config.Gias.Password
      }
    })
    const response = await this.soapRequestService.execute({
      action: actionId,
      namespace: config.Gias.Namespace,
      serviceUrl: config.Gias.ServiceUrl,
      soapXml: messageXml,
      timeout: config.Gias.RequestTimeoutInMilliseconds
    })
    return xmlParser.parse(response.body, xmlParserOptions)
  }

  async GetExtract (extractId: string): Promise<any> {
    return this.makeRequest('GetExtract', {
      Id: extractId
    })
  }

  async GetEstablishment (urn: number): Promise<any> {
    const response = await this.makeRequest('GetEstablishment', {
      Urn: urn
    })
    return response.Envelope.Body.GetEstablishmentResponse.Establishment
  }
}

export interface IExtractResult {
  extractId: string,
  data: any
}
