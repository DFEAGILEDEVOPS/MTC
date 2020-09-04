import { ISoapMessageBuilder, SoapMessageBuilder } from './soap-message-builder'
import config from '../../config'
import { ISoapRequestService, SoapRequestService } from './soap-request.service'
import { IXmlParser, XmlParser } from './xml-parser'
import { IMultipartMessageParser, MultipartMessageParser } from './multipart-message-parser'
import { IZipService, ZipService } from './zip.service'

export class GiasService {
  private soapMessageBuilder: ISoapMessageBuilder
  private soapRequestService: ISoapRequestService
  private xmlParser: IXmlParser
  private multipartMessageParser: IMultipartMessageParser
  private zipService: IZipService

  constructor (soapMessageBuilder?: ISoapMessageBuilder,
    soapRequestService?: ISoapRequestService,
    xmlParser?: IXmlParser,
    multipartMessageParser?: IMultipartMessageParser,
    zipService?: IZipService) {
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
    if (multipartMessageParser === undefined) {
      multipartMessageParser = new MultipartMessageParser()
    }
    this.multipartMessageParser = multipartMessageParser
    if (zipService === undefined) {
      zipService = new ZipService()
    }
    this.zipService = zipService
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
    return this.soapRequestService.execute({
      action: actionId,
      namespace: config.Gias.Namespace,
      serviceUrl: config.Gias.ServiceUrl,
      soapXml: messageXml,
      timeout: config.Gias.RequestTimeoutInMilliseconds
    })
  }

  async GetExtract (extractId: number): Promise<string> {
    const soapResponse = await this.makeRequest('GetExtract', {
      Id: extractId
    })
    const parts = this.multipartMessageParser.parse(soapResponse)
    const parsedXmlPart = this.xmlParser.parse(parts[0].content.toString('utf8'))
    const attachmentId = parsedXmlPart.Envelope.Body.GetExtractResponse.Extract.Include.attr.href.substr(4).replace('%40', '@')
    const attachmentPart = parts.find(x => x.id === attachmentId)
    if (attachmentPart === undefined) throw new Error(`could not find attachment part with id:${attachmentId}`)
    const zipBuffer = Buffer.from(attachmentPart.content)
    const zipEntries = this.zipService.extractEntriesFromZipBuffer(zipBuffer)
    if (zipEntries.length === 0) {
      throw new Error('no valid entries found in zip file')
    } else {
      console.log(`there are ${zipEntries.length} in the zip`)
    }
    const extractFile = zipEntries[0]
    console.log(`extractFile is ${extractFile.length} bytes`)
    const bufferString = extractFile.toString()
    return bufferString
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
