import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'

export class GiasService {
  private soapMessageBuilder: ISoapMessageBuilder

  constructor (soapMessageBuilder?: ISoapMessageBuilder) {
    if (soapMessageBuilder === undefined) {
      soapMessageBuilder = new SoapMessageBuilder()
    }
    this.soapMessageBuilder = soapMessageBuilder
  }

  async GetExtract (extractId: string): Promise<IExtractResult> {
    this.soapMessageBuilder.buildMessage({
      action: 'hello',
      messageExpiryMs: 0,
      namespace: 'test'
    })
    return Promise.resolve({
      extractId: extractId
    })
  }
}

export interface IExtractResult {
  extractId: string
}
