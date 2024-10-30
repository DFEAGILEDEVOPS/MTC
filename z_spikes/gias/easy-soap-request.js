'use strict'

require('dotenv').config()
const soapRequest = require('easy-soap-request')

const url = process.env.WS_ENDPOINT
const headers = {
  'method': 'POST',
  'user-agent': 'mtc-soap-service',
  'Content-Type': 'text/xmlcharset=UTF-8',
  'soapAction': `${process.env.WS_NS}/GetEstablishment`
}

/* const soapAction = 'GetEstablishment'
const actionParams = {
  Id: 100044 // st michaels school
} */

const expiryInMilliseconds = 10000
const createdAt = new Date()
const expiresAt = new Date(Date.now() + expiryInMilliseconds)
const timeoutInMilliseconds = 5000

const requestBodyXml = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:ws="${process.env.WS_NS}">
                          <soapenv:Header>
                            <wsse:Security soapenv:mustUnderstand="1"
                              xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                              <wsu:Timestamp wsu:Id="XWSSGID-${createdAt.getTime()}" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                                <wsu:Created>${createdAt.toISOString()}</wsu:Created>
                                <wsu:Expires>${expiresAt.toISOString()}</wsu:Expires>
                              </wsu:Timestamp>
                              <wsse:UsernameToken>
                                <wsse:Username>${process.env.WS_USERNAME}</wsse:Username>
                                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${process.env.WS_PASSWORD}</wsse:Password>
                              </wsse:UsernameToken>
                              </wsse:Security>
                          </soapenv:Header>
                          <soapenv:Body>
                            <ws:GetEstablishment>
                              <ws:Urn>100044</ws:Urn>
                            </ws:GetEstablishment>
                          </soapenv:Body>
                      </soapenv:Envelope>`

console.log(`request....\n${requestBodyXml}`)
soapRequest({ url: url, headers: headers, xml: requestBodyXml, timeout: timeoutInMilliseconds })
  .then((response) => {
    const { headers, body, statusCode } = response
    console.log(headers)
    console.log(body)
    console.log(statusCode)
  })
  .catch((error) => {
    console.error(error)
  })
