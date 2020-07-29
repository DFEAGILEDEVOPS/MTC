require('dotenv').config()
const soap = require('soap')

const url = process.env.WSDL_URL
console.log(`loading metadata from ${url}`)
const args = { Urn: 103202 }
const options = {
  wsdl_headers: {
    cookie: process.env.AUTH_COOKIE
  }
}
soap.createClient(url, options, function (err, client) {
  if (err) {
    console.error(err)
  } else {
    client.GetEstablishment(args, function (err, result) {
      if (err) {
        console.error(err)
      } else {
        console.log(result)
      }
    })
  }
})
