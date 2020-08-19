export class SoapService {

  buildMessage (messageSpec: ISoapMessageSpecification): string {
    let xml = `
      <?xml version="1.0"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:ws="${messageSpec.namespace}">`
    xml = `${xml}<soapenv:Header>`
    if (messageSpec.credentials || messageSpec.messageExpiryMs > 0) {
      xml = `${xml}<wsse:Security soapenv:mustUnderstand="1"
        xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">`
      if (messageSpec.credentials) {
        xml = `${xml}<wsse:UsernameToken>`
        xml = `${xml}<wsse:Username>${messageSpec.credentials.username}</wsse:Username>`
        xml = `${xml}<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${messageSpec.credentials.password}</wsse:Password>`
        xml = `${xml}</wsse:UsernameToken>`
      }
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
