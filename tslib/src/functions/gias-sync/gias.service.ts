import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'
import config from '../../config'
import { ISoapRequestService, SoapRequestService } from './soap-request.service'

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
    const wsActionId = 'GetEstablishment'
    const messageXml = this.soapMessageBuilder.buildMessage({
      action: wsActionId,
      messageExpiryMs: config.Gias.MessageExpiryInMilliseconds,
      namespace: config.Gias.Namespace,
      parameters: {
        Urn: urn
      }
    })
    return this.soapRequestService.execute({
      action: wsActionId,
      namespace: config.Gias.Namespace,
      serviceUrl: config.Gias.ServiceUrl,
      soapXml: messageXml,
      timeout: config.Gias.RequestTimeoutInMilliseconds
    })
  }
}

export interface IExtractResult {
  extractId: string,
  data: any
}
