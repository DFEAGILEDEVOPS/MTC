export class SoapService {

  buildMessage (messageSpec: ISoapMessageSpecification): string {
    return `<username=${messageSpec.credentials.username}`
  }
}

export interface ISoapMessageSpecification {
  action: string
  parameters?: any
  credentials: ISoapMessageCredentials
  messageExpiryMs: number
}

export interface ISoapMessageCredentials {
  username: string
  password: string
}
