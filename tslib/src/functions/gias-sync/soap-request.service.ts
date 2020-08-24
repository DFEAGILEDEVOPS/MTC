import * as easySoap from 'easy-soap-request'

export class SoapRequestService implements ISoapRequestService {
  async execute (request: ISoapRequest): Promise<any> {
    const headers = {
      'method': 'POST',
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': `${request.namespace}/${request.action}`
    }
    return easySoap.default({
      url: request.serviceUrl,
      headers: headers,
      xml: request.soapXml,
      timeout: request.timeout
    })
  }
}

export interface ISoapRequestService {
  execute (request: ISoapRequest): Promise<any>
}

export interface ISoapResponse {}

export interface ISoapRequest {
  namespace: string,
  action: string,
  timeout: number,
  serviceUrl: string,
  soapXml: string
}
