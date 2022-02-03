const SoapMessage = require('./SoapMessage')
const soapRequest = require('easy-soap-request')
require('dotenv').config()

// st michaels school
const action = {
  name: 'GetEstablishment',
  params: {
    Urn: 100044
  }
}

const getEstabXml = new SoapMessage(action.name, action.params)
  .setUsernamePassword(process.env.WS_USERNAME, process.env.WS_PASSWORD)
  .setMessageExpiry(10000).toXmlString()

const serviceUrl = process.env.WS_ENDPOINT
const headers = {
  'method': 'POST',
  'Content-Type': 'text/xml;charset=UTF-8',
  'SOAPAction': `${process.env.WS_NS}/GetEstablishment`
}
const timeoutInMilliseconds = 5000

soapRequest({
  url: serviceUrl,
  headers: headers,
  xml: getEstabXml,
  timeout: timeoutInMilliseconds
}).then((resolve, reject) => {
  console.dir(resolve)
}).catch((error) => {
  console.error(error)
})

