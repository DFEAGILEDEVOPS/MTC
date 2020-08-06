'use strict'

const lpad = (value, length = 2) => {
  let padded = value.toString()
  if (padded.length > length) {
    return padded.substr(padded.length - length)
  }
  while (padded.length < length) {
    padded = '0' + padded
  }
  return padded
}
const formatDate = (date) => {
  const yyyy = date.getUTCFullYear()
  const mm = date.getUTCMonth() + 1
  const dd = date.getUTCDate()
  const hh = date.getUTCHours()
  const mi = date.getUTCMinutes()
  const ss = date.getUTCSeconds()
  const ms = date.getUTCMilliseconds()

  return `${yyyy}-${lpad(mm)}-${lpad(dd)}T${lpad(hh)}:${lpad(mi)}:${lpad(ss)}.${lpad(ms, 3)}Z`
}

class SoapMessage {
  constructor (action, parameters) {
    this.action = action
    this.parameters = parameters
    this.credentials = undefined
    this.messageExpiresInMilliseconds = 0
  }

  setUsernamePassword (username, password) {
    this.credentials = undefined
    if (username) {
      this.credentials = { username, password }
    }
    return this
  }

  setMessageExpiry (expiresInMilliseconds) {
    this.messageExpiresInMilliseconds = expiresInMilliseconds
    return this
  }

  toXmlString () {
    let xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.edubase.texunatech.com">'

    xml = `${xml}`

    // Header
    xml = `${xml}<soapenv:Header>`
    if (this.credentials || this.messageExpiresInMilliseconds > 0) {
      xml = `${xml}<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">`
    }
    if (this.messageExpiresInMilliseconds > 0) {
      const created = new Date()
      const expires = new Date(Date.now() + this.messageExpiresInMilliseconds)

      xml = `${xml}<wsu:Timestamp wsu:Id="XWSSGID-${created.getTime()}" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">`
      xml = `${xml}<wsu:Created>${formatDate(created)}</wsu:Created>`
      xml = `${xml}<wsu:Expires>${formatDate(expires)}</wsu:Expires>`
      xml = `${xml}</wsu:Timestamp>`
    }
    if (this.credentials) {
      xml = `${xml}<wsse:UsernameToken>`
      xml = `${xml}<wsse:Username>${this.credentials.username}</wsse:Username>`
      xml = `${xml}<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${this.credentials.password}</wsse:Password>`
      xml = `${xml}</wsse:UsernameToken>`
    }
    if (this.credentials || this.messageExpiresInMilliseconds > 0) {
      xml = `${xml}</wsse:Security>`
    }
    xml = `${xml}</soapenv:Header>`

    // Body
    xml = `${xml}<soapenv:Body>`
    xml = `${xml}<ws:${this.action}>`

    if (this.parameters) {
      const paramNames = Object.keys(this.parameters)
      paramNames.forEach((name) => {
        const value = this.parameters[name]
        xml = `${xml}<ws:${name}>${value}</ws:${name}>`
      })
    }

    xml = `${xml}</ws:${this.action}>`
    xml = `${xml}</soapenv:Body>`

    return `${xml}</soapenv:Envelope>`
  }
}

module.exports = SoapMessage
