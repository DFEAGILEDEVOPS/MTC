import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'
import config from '../../config'
import { ISoapRequestService, SoapRequestService } from './soap-request.service'
import { IXmlParser, XmlParser } from './xml-parser'

export class GiasService {
  private soapMessageBuilder: ISoapMessageBuilder
  private soapRequestService: ISoapRequestService
  private xmlParser: IXmlParser

  constructor (soapMessageBuilder?: ISoapMessageBuilder,
                soapRequestService?: ISoapRequestService,
                xmlParser?: IXmlParser) {
    if (soapMessageBuilder === undefined) {
      soapMessageBuilder = new SoapMessageBuilder()
    }
    this.soapMessageBuilder = soapMessageBuilder
    if (soapRequestService === undefined) {
      soapRequestService = new SoapRequestService()
    }
    this.soapRequestService = soapRequestService
    if (xmlParser === undefined) {
      xmlParser = new XmlParser()
    }
    this.xmlParser = xmlParser
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
    return response
  }

  async GetExtract (extractId: string): Promise<any> {
    const response = await this.makeRequest('GetExtract', {
      Id: extractId
    })
    console.log(`body length:${response.body.length}`)
    delete response.body
    return response
    // return response.Envelope.Body.GetExtractResponse
  }

  async GetEstablishment (urn: number): Promise<any> {
    const response = await this.makeRequest('GetEstablishment', {
      Urn: urn
    })
    const parsed = this.xmlParser.parse(response.body)
    return parsed.Envelope.Body.GetEstablishmentResponse.Establishment
  }
}

export interface IExtractResult {
  extractId: string,
  data: any
}
