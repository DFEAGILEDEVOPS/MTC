const soapRequest = require('easy-soap-request')
const fs = require('fs')

const url = process.env.WS_URL
const headers = {
  'method': 'POST',
  'user-agent': 'mtc-soap-service',
  'Content-Type': 'text/xmlcharset=UTF-8',
  'soapAction': `${process.env.WSDL_URL}#GetEstablishment`
}

const soapAction = 'GetEstablishment'

const soapEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                          <soapenv:Header>
                            <wsse:Security soapenv:mustUnderstand="1"
                              xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                              <wsse:UsernameToken>
                                <wsse:Username>${process.env.WS_USERNAME}</wsse:Username>
                                <wsse:Password
                                  Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">
                                    ${process.env.WS_PASSWORD}
                                </wsse:Password>
                              </wsse:UsernameToken>
                              </wsse:Security>
                          </soapenv:Header>
                          <soapenv:Body>
                            <ws:${soapAction}>
                          </soapenv:Body>
                      </soapenv:Envelope>`
const oneSecondInMilliseconds = 1000

soapRequest({ url: url, headers: headers, xml: soapEnvelope, timeout: oneSecondInMilliseconds })
  .then((response) => {
    const { headers, body, statusCode } = response
    console.log(headers)
    console.log(body)
    console.log(statusCode)
  })

  /* (async () => {
    const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: messageEnvelope, timeout: oneSecondInMilliseconds })
    const { headers, body, statusCode } = response
    console.log(headers)
    console.log(body)
    console.log(statusCode)
  })() */
