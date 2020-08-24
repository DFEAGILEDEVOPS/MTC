import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'
import config from '../../config'

export class GiasService {
  private soapMessageBuilder: ISoapMessageBuilder

  constructor (soapMessageBuilder?: ISoapMessageBuilder) {
    if (soapMessageBuilder === undefined) {
      soapMessageBuilder = new SoapMessageBuilder()
    }
    this.soapMessageBuilder = soapMessageBuilder
  }

  async GetExtract (extractId: string): Promise<IExtractResult> {
    if (config.Gias.Namespace === undefined) {
      throw new Error('gias web service namespace is required')
    }
    this.soapMessageBuilder.buildMessage({
      action: 'GetExtract',
      messageExpiryMs: config.Gias.MessageExpiryInMilliseconds,
      namespace: config.Gias.Namespace || '',
      parameters: {
        Id: extractId
      }
    })
    return Promise.resolve({
      extractId: extractId,
      data: []
    })
  }
}

export interface IExtractResult {
  extractId: string,
  data: Array<any>
}
