import * as soapReqest from 'easy-soap-request'

export class SoapRequestService {
  async execute (request: ISoapRequest): Promise<ISoapResponse> {
    const headers = {
      'method': 'POST',
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': `${request.namespace}/${request.action}`
    }
    return soapReqest({
      url: request.serviceUrl,
      headers: headers,
      xml: request.soapXml,
      timeout: request.timeout
    })
  }
}

export interface ISoapRequestService {
  execute (request: ISoapRequest): ISoapResponse
}

export interface ISoapResponse {}

export interface ISoapRequest {
  namespace: string,
  action: string,
  timeout: number,
  serviceUrl: string,
  soapXml: string
}
