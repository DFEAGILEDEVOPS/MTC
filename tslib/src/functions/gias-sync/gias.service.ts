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
      action: 'GetExtract',
      messageExpiryMs: 0,
      namespace: 'test',
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
