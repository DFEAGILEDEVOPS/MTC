import { IDateTimeService, DateTimeService } from '../../common/datetime.service'

export class SoapService {

  private dateTimeService: IDateTimeService

  constructor (dateTimeService?: IDateTimeService) {
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
  }

  buildMessage (messageSpec: ISoapMessageSpecification): string {
    let xml = `
      <?xml version="1.0"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:ws="${messageSpec.namespace}">`
    xml = `${xml}<soapenv:Header>`
    if (messageSpec.credentials || messageSpec.messageExpiryMs > 0) {
      xml = `${xml}<wsse:Security soapenv:mustUnderstand="1"
        xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">`

      if (messageSpec.messageExpiryMs > 0) {
        const created = this.dateTimeService.utcNow().toDate()
        const expires = this.dateTimeService.utcNow().add(messageSpec.messageExpiryMs, 'milliseconds').toDate()

        xml = `${xml}<wsu:Timestamp wsu:Id="XWSSGID-${created.getTime()}" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">`
        xml = `${xml}<wsu:Created>${created.toISOString()}</wsu:Created>`
        xml = `${xml}<wsu:Expires>${expires.toISOString()}</wsu:Expires>`
        xml = `${xml}</wsu:Timestamp>`
      }

      if (messageSpec.credentials) {
        xml = `${xml}<wsse:UsernameToken>`
        xml = `${xml}<wsse:Username>${messageSpec.credentials.username}</wsse:Username>`
        xml = `${xml}<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${messageSpec.credentials.password}</wsse:Password>`
        xml = `${xml}</wsse:UsernameToken>`
      }
      xml = `${xml}</wsse:Security>`
    }
    xml = `${xml}</soapenv:Header>`
    return xml
  }
}

export interface ISoapMessageSpecification {
  action: string
  namespace: string
  parameters?: any
  credentials?: ISoapMessageCredentials
  messageExpiryMs: number
}

export interface ISoapMessageCredentials {
  username: string
  password: string
}
