'use strict'

const websiteOffline = async (req, res) => {
  res.locals.pageTitle = 'Service Unavailable'
  res.setHeader('Cache-Control', 'no-cache')
  res.render('website-offline.ejs')
}

module.exports = { websiteOffline }
