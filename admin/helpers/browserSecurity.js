'use strict'

const helmet = require('helmet')
const nocache = require('nocache')
const config = require('../config')

const init = (app) => {
  app.use(helmet())
  app.use(nocache())
  const scriptSources = ['\'self\'', '\'unsafe-inline\'', 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'https://az416426.vo.msecnd.net']
  const styleSources = ['\'self\'', '\'unsafe-inline\'']
  const imgSources = ['\'self\'', 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'data:']
  const objectSources = ['\'self\'']

  if (config.AssetPath !== '/') {
    // add CSP policy for assets domain
    scriptSources.push(config.AssetPath)
    styleSources.push(config.AssetPath)
    imgSources.push(config.AssetPath)
    objectSources.push(config.AssetPath)
  }
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: scriptSources,
      fontSrc: ['\'self\'', 'data:', config.AssetPath],
      styleSrc: styleSources,
      imgSrc: imgSources,
      connectSrc: ['\'self\'', 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'https://dc.services.visualstudio.com/v2/track'],
      objectSrc: objectSources,
      mediaSrc: ['\'none\''],
      childSrc: ['\'none\'']
    }
  }))

  // Permissions policy replaces feature policy.
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()'
    )
    next()
  })

  // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
  const oneYearInSeconds = 31536000
  app.use(helmet.hsts({
    maxAge: oneYearInSeconds,
    includeSubDomains: true,
    preload: true
  }))
}

module.exports = init
