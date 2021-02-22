'use strict'

const ValidationError = require('../lib/validation-error')
const uuidValidator = require('../lib/validator/common/uuid-validator')
const checkDiagnosticsService = require('../services/check-diagnostic.service')
const payloadService = require('../services/payload.service')
const redisService = require('../services/tech-support/redis.service')
const administrationMessageService = require('../services/administration-message.service')
const redisErrorMessages = require('../lib/errors/redis').redis

const controller = {
/**
 * Renders the tech support landing page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
  getHomePage: async function getHomePage (req, res, next) {
    res.locals.pageTitle = 'Tech Support Homepage'
    try {
      const serviceMessage = await administrationMessageService.getMessage()
      return res.render('tech-support/home', {
        breadcrumbs: req.breadcrumbs(),
        serviceMessage
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
 * Renders the check view input form
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
  getCheckViewPage: async function getCheckViewPage (req, res, next, error = null) {
    res.locals.pageTitle = 'Tech Support Check View'
    req.breadcrumbs('Check View')
    try {
      return res.render('tech-support/check-view', {
        breadcrumbs: req.breadcrumbs(),
        formData: {},
        err: error || new ValidationError(),
        summary: undefined,
        found: undefined
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
 * Renders check view summary
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
  postCheckViewPage: async function postCheckViewPage (req, res, next) {
    res.locals.pageTitle = 'Tech Support Check View'
    const { checkCode } = req.body
    try {
      const validationError = uuidValidator.validate(checkCode, 'checkCode')
      if (validationError && validationError.hasError && validationError.hasError()) {
        return controller.getCheckViewPage(req, res, next, validationError)
      }
      let found = false
      const checkSummary = await checkDiagnosticsService.getByCheckCode(checkCode)
      if (checkSummary) {
        found = true
      }
      req.breadcrumbs('Check View')
      res.render('tech-support/check-view', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          checkCode: checkCode
        },
        summary: checkSummary,
        found: found
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
   * @description Renders received check payload
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  getReceivedCheckPayload: async function getReceivedCheckPayload (req, res, next) {
    const checkCode = req.query.checkCode.trim()
    let payload
    try {
      payload = await payloadService.getPayload(checkCode)
      res.type('json')
      res.send(JSON.stringify(payload, null, '    '))
    } catch (error) {
      res.type('txt')
      res.send(`${error}`)
    }
  },

  showRedisOverview: async function showRedisOverview (req, res, next) {
    req.breadcrumbs('Redis Overview')
    res.locals.pageTitle = 'Redis Overview'
    try {
      const dataBulkString = await redisService.getServerInfo()
      res.render('tech-support/redis-overview', {
        breadcrumbs: req.breadcrumbs(),
        info: dataBulkString
      })
    } catch (error) {
      return next(error)
    }
  },

  getRedisDropKeyPage: async function getDropKeyPage (req, res, next, error = new ValidationError()) {
    req.breadcrumbs('Drop Key')
    res.locals.pageTitle = 'Redis - Drop Key'
    try {
      // optional redis key param
      const redisKey = req.params.redisKey
      res.render('tech-support/redis-drop-key', {
        breadcrumbs: req.breadcrumbs(),
        key: redisKey ?? '',
        error
      })
    } catch (error) {
      return next(error)
    }
  },

  postRedisDropKeyConfirm: async function postRedisDropKeyConfirm (req, res, next) {
    try {
      const key = req.body.key.trim()
      if (redisService.validateKey(key)) {
        return res.redirect(`/tech-support/redis/drop/confirm/${encodeURIComponent(key)}`)
      } else {
        const error = new ValidationError()
        error.addError('key', redisErrorMessages.dropNotAllowed)
        return controller.getRedisDropKeyPage(req, res, next, error)
      }
    } catch (error) {
      return next(error)
    }
  },

  getRedisDropKeyConfirm: async function getDropConfirmPage (req, res, next) {
    try {
      req.breadcrumbs('Confirm Drop Key')
      res.locals.pageTitle = 'Redis - Confirm Drop Key'
      const key = req.params.redisKey
      if (key && key.length > 0) {
        const metaInfo = await redisService.getObjectMeta(key)
        return res.render('tech-support/redis-confirm-drop', {
          breadcrumbs: req.breadcrumbs(),
          key,
          metaInfo
        })
      } else {
        req.flash('info', 'Key not provided')
        return res.redirect('/tech-support/home')
      }
    } catch (error) {
      return next(error)
    }
  },

  postRedisDropKey: async function postRedisDropKey (req, res, next) {
    try {
      const key = req.body.key
      const isDropped = await redisService.dropKeyIfAllowed(key)
      if (isDropped) {
        req.flash('info', `Key '${key}' was deleted from redis`)
      } else {
        req.flash('info', 'Key is not allowed to be dropped')
      }
      return res.redirect('/tech-support/home')
    } catch (error) {
      next(error)
    }
  },

  getRedisSearchKey: async function getRedisSearchKey (req, res, next, error = new ValidationError()) {
    try {
      res.locals.pageTitle = 'Redis - Search for a key'
      req.breadcrumbs('Redis - search')
      res.render('tech-support/redis-search', {
        breadcrumbs: req.breadcrumbs(),
        error
      })
    } catch (error) {
      return next(error)
    }
  },

  postRedisSearchKey: async function postRedisSearchKey (req, res, next) {
    try {
      const key = req.body.key?.trim()
      const isAllowed = redisService.validateKey(key)
      if (!isAllowed) {
        const error = new ValidationError()
        error.addError('key', redisErrorMessages.dropNotAllowed)
        return controller.getRedisSearchKey(req, res, next, error)
      }
      res.redirect(`/tech-support/redis/examine/${encodeURIComponent(key)}`)
    } catch (error) {
      return next(error)
    }
  },

  getExamineRedisKey: async function getExamineRedisKey (req, res, next) {
    try {
      res.locals.pageTitle = 'Redis - examine key'
      req.breadcrumbs('Redis - examine')
      const key = req.params?.key
      const isAllowed = redisService.validateKey(key)
      if (!isAllowed) {
        const error = new ValidationError()
        error.addError('key', redisErrorMessages.dropNotAllowed)
        return controller.getRedisSearchKey(req, res, next, error)
      }
      if (!key || key.length === 0) {
        return next(new Error('Invalid key'))
      }
      const metaInfo = await redisService.getObjectMeta(key)
      return res.render('tech-support/redis-examine-key', {
        breadcrumbs: req.breadcrumbs(),
        key,
        metaInfo
      })
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = controller
