import axios, { AxiosRequestConfig } from 'axios'

export class SoapRequestService implements ISoapRequestService {
  async execute (request: ISoapRequest): Promise<ISoapResponse> {
    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: `${request.namespace}/${request.action}`
    }
    const config: AxiosRequestConfig = {
      method: 'POST',
      headers: headers,
      url: request.serviceUrl,
      data: request.soapXml,
      timeout: request.timeout,
      responseType: 'arraybuffer'
    }
    const response = await axios(config)
    return {
      body: response.data,
      headers: response.headers
    }
  }
}

export interface ISoapRequestService {
  execute (request: ISoapRequest): Promise<any>
}

export interface ISoapResponse {
  body: any
  headers: any
}

export interface ISoapRequest {
  namespace: string
  action: string
  timeout: number
  serviceUrl: string
  soapXml: string
}
