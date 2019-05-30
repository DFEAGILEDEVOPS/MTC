'use strict'

const payloadService = require('../services/payload.service')
const logger = require('../services/log.service').getLogger()

const controller = {
  getViewPayloadForm: async function (req, res, next) {
    res.locals.pageTitle = 'View pupil payload'
    try {
      req.breadcrumbs(res.locals.pageTitle)
      res.render('test-developer/view-pupil-payload-form', {
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      next(error)
    }
  },

  postViewPayload: async function postViewPayload (req, res, next) {
    logger.info(`postViewPayload(): called for checkCode ${req.body.checkCode} by user '${req.user.UserName}' (id ${req.user.id})`)
    let response
    try {
      const payload = await payloadService.getPayload(req.body.checkCode.trim())
      response = payload
    } catch (error) {
      logger.error(error)
      response = { message: 'check not found' }
    }
    res.type('json')
    res.send(JSON.stringify(response, null, '    '))
  }
}

module.exports = controller
