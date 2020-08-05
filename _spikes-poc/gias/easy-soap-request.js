'use strict'

require('dotenv').config()
const soapRequest = require('easy-soap-request')

const url = process.env.WS_URL
const headers = {
  'method': 'POST',
  'user-agent': 'mtc-soap-service',
  'Content-Type': 'text/xmlcharset=UTF-8',
  'soapAction': `${process.env.WS_URL}/GetEstablishment`
}

/* const soapAction = 'GetEstablishment'
const actionParams = {
  Id: 100044 // st michaels school
} */

const soapEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:ws="${process.env.WS_NS}">
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
                            <ws:GetEstablishment>
                              <ws:Urn>100044</ws:Urn>
                            </ws:GetEstablishment>
                          </soapenv:Body>
                      </soapenv:Envelope>`
const timeoutInMilliseconds = 5000

soapRequest({ url: url, headers: headers, xml: soapEnvelope, timeout: timeoutInMilliseconds })
  .then((response) => {
    const { headers, body, statusCode } = response
    console.log(headers)
    console.log(body)
    console.log(statusCode)
  })
  .catch((error) => {
    console.error(error)
  })
