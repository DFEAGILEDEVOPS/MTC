'use strict'

const ValidationError = require('../lib/validation-error')
const payloadService = require('../services/payload.service')
const logger = require('../services/log.service').getLogger()

const controller = {
  getViewPayloadForm: async function (req, res, next, error) {
    res.locals.pageTitle = 'View pupil payload'
    try {
      req.breadcrumbs(res.locals.pageTitle)
      res.render('test-developer/view-pupil-payload-form', {
        formData: req.body,
        error: error || new ValidationError(),
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      next(error)
    }
  },

  postViewPayload: async function postViewPayload (req, res, next, error) {
    console.log('User ', req.user)
    logger.info(`postViewPayload(): called for checkCode ${req.body.checkCode} by user '${req.user.UserName}' (id ${req.user.id})`)
    const payload = await payloadService.getPayload(req.body.checkCode)
    try {
      res.type('json')
      res.send(JSON.stringify(payload, null, '    '))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = controller
