'use strict'

const { parseString, processors } = require('xml2js')
const SoapMessage = require('./SoapMessage')
const MultipartMessage = require('./MultipartMessage')
const soapRequest = require('easy-soap-request')
const { promisify } = require('util')
const parseXml = promisify(parseString)

const requestTimeout = process.env.REQUEST_TIMEOUT || 5000
const messageExpiryMs = process.env.WS_MESSAGE_EXPIRY || 10000

const service = {
  getExtract: async function getExtract (extractId) {
    const requestBody = new SoapMessage('GetExtract', { Id: extractId })
      .setUsernamePassword(process.env.WS_USERNAME, process.env.WS_PASSWORD)
      .setMessageExpiry(messageExpiryMs).toXmlString()
    const serviceUrl = process.env.WS_ENDPOINT
    const headers = {
      'method': 'POST',
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': `${process.env.WS_NS}/GetEstablishment`
    }
    const response = await soapRequest({
      url: serviceUrl,
      headers: headers,
      xml: requestBody,
      timeout: requestTimeout
    }).then((resolve, reject) => {
      console.dir(resolve)
    }).catch((error) => {
      console.error(error)
    })
    const responseMessage = MultipartMessage.parse(response.body, MultipartMessage.getBoundaryIdFromResponse(response))
    const soapResponse = await parseXml(responseMessage.parts[0].content, {
      tagNameProcessors: [processors.stripPrefix, processors.firstCharLowerCase],
      explicitArray: false
    })

    const attachmentId = soapResponse.envelope.body.getExtractResponse.extract.include.$.href.substr(4).replace('%40', '@')
    const attachment = responseMessage.parts.find(x => x.id === attachmentId)
    return {
      createdAt: new Date(soapResponse.envelope.header.security.timestamp.created),
      expiresAt: new Date(soapResponse.envelope.header.security.timestamp.expires),
      content: attachment.content
    }
  }
}

module.exports = service
