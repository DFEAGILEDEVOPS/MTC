'use strict'

const ValidationError = require('../lib/validation-error')
const uuidValidator = require('../lib/validator/common/uuid-validator')
const checkDiagnosticsService = require('../services/check-diagnostic.service')
const payloadService = require('../services/payload.service')
const redisService = require('../services/tech-support/redis.service')
const redisErrorMessages = require('../lib/errors/redis').redis
const moment = require('moment')
const queueMgmtService = require('../services/queue-management.service')
const resultsResyncService = require('../services/tech-support/sync-results-resync.service')
const { PsReportExecService } = require('../services/tech-support/ps-report-exec/ps-report-exec.service')
const { CheckSubmitService } = require('../services/tech-support/check-submit/check-submit.service')

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
      return res.render('tech-support/home', {
        breadcrumbs: req.breadcrumbs()
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
      let checkReceived, checkMarked
      if (checkSummary) {
        found = true
        try {
          checkReceived = await checkDiagnosticsService.getReceivedCheckEntityByCheckCode(checkCode)
        } catch (ignored) {}
        try {
          checkMarked = await checkDiagnosticsService.getMarkedCheckEntityByCheckCode(checkCode)
        } catch (ignored) {}
      }
      req.breadcrumbs('Check View')
      res.render('tech-support/check-view', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          checkCode
        },
        summary: checkSummary,
        found,
        checkReceived,
        checkMarked
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Renders marked check from Azure Table Storage in JSON response, or an error.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  getJsonMarkedCheck: async function getJsonMarkedCheck (req, res, next) {
    const jsonError = {
      error: 'Error'
    }
    try {
      const checkCode = req.params.checkCode
      if (!checkCode) {
        jsonError.error = 'Missing checkCode'
        return res.status(400).json(jsonError)
      }
      const validationError = uuidValidator.validate(checkCode, 'checkCode')
      if (validationError && validationError.hasError && validationError.hasError()) {
        jsonError.error = 'checkCode is not a valid UUID'
        return res.status(400).json(jsonError)
      }
      const markedCheck = await checkDiagnosticsService.getMarkedCheckEntityByCheckCode(checkCode)
      res.type('json')
      res.send(JSON.stringify(markedCheck, null, '    '))
    } catch (error) {
      jsonError.error = `Server error: ${error.message}`
      res.status(500).json(jsonError)
    }
  },

  /**
   * Renders ReceivedCheck (minus payload) in JSON response, or an error
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  getJsonReceivedCheck: async function getJsonReceivedCheck (req, res, next) {
    const jsonError = {
      error: 'Error'
    }

    try {
      const checkCode = req.params.checkCode
      if (!checkCode) {
        jsonError.error = 'Missing checkCode'
        return res.status(400).json(jsonError)
      }
      const validationError = uuidValidator.validate(checkCode, 'checkCode')
      if (validationError && validationError.hasError && validationError.hasError()) {
        jsonError.error = 'checkCode is not a valid UUID'
        return res.status(400).json(jsonError)
      }
      const receivedCheck = await checkDiagnosticsService.getReceivedCheckEntityByCheckCode(checkCode)
      res.type('json')
      res.send(JSON.stringify(receivedCheck, null, '    '))
    } catch (error) {
      jsonError.error = `Server error: ${error.message}`
      res.status(500).json(jsonError)
    }
  },

  /**
   * @description Renders received check payload in JSON response
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
      const isAllowed = await redisService.dropKeyIfAllowed(key)
      if (isAllowed) {
        req.flash('info', `Key '${key}' was deleted from redis`)
      } else {
        // Key is not allowed / not found
        const error = new Error('Invalid key')
        // @ts-ignore
        error.status = 404
        return next(error)
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
        error,
        key: req.body?.k ?? ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postRedisSearchKey: async function postRedisSearchKey (req, res, next) {
    try {
      const key = req.body.key?.trim()
      const item = await redisService.get(key)
      if (item === undefined) {
        const error = new ValidationError()
        error.addError('key', `Key '${key}' does not exist`)
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
  },

  getRedisBatchDropPage: async function getRedisBatchDropPage (req, res, next) {
    try {
      res.locals.pageTitle = 'Redis - batch delete keys'
      req.breadcrumbs('Redis - Batch delete')
      res.render('tech-support/redis-multiple-drop', {
        breadcrumbs: req.breadcrumbs(),
        keyTypes: redisService.batchTokenKeyTypes
      })
    } catch (error) {
      return next(error)
    }
  },

  postRedisBatchDropRedirectToConfirmPage: async function postRedisBatchDropRedirectToConfirmPage (req, res, next) {
    try {
      let keys = req.body.key
      if (keys === undefined) {
        throw new Error('missing key')
      }
      if (typeof keys === 'string') {
        keys = [keys]
      }
      const isValid = redisService.validateBatchTokens(keys)
      if (!isValid) {
        return next(new Error('Unknown token detected'))
      }
      const qs = keys.map(k => `k=${encodeURIComponent(k)}`).join('&')
      res.redirect(`/tech-support/redis/multiple/drop/confirm?${qs}`)
    } catch (error) {
      return next(error)
    }
  },

  postRedisBatchDropConfirmPage: async function postRedisBatchDropConfirmPage (req, res, next) {
    try {
      const keys = req.query.k
      const isValid = redisService.validateBatchTokens(keys)
      if (!isValid) {
        return next(new Error('One of the batch tokens was invalid'))
      }
      const keyElements = redisService.filterTokens(keys)
      res.locals.pageTitle = 'Redis - batch delete keys'
      req.breadcrumbs('Redis - Confirm batch delete')
      res.render('tech-support/redis-multiple-drop-confirm', {
        breadcrumbs: req.breadcrumbs(),
        keys: keyElements
      })
    } catch (error) {
      return next(error)
    }
  },

  postRedisBatchDrop: async function postRedisBatchDrop (req, res, next) {
    try {
      let keys = req.body.key
      if (typeof keys === 'string') {
        keys = [keys]
      }
      const t1 = moment().valueOf()
      await redisService.multiDrop(keys)
      const t2 = moment().valueOf()
      const timeTaken = (t2 - t1) / 1000
      req.flash('info', `Redis keys [${keys.join(', ')}] dropped in ${timeTaken} seconds`)
      res.redirect('/tech-support/redis-overview')
    } catch (error) {
      return next(error)
    }
  },

  showQueueOverview: async function showQueueOverview (req, res, next) {
    req.breadcrumbs('Queue Overview')
    res.locals.pageTitle = 'Queue Overview'
    try {
      const sbQueueInfo = await queueMgmtService.getServiceBusQueueSummary()
      const storageQueueInfo = await queueMgmtService.getStorageAccountQueueSummary()
      res.render('tech-support/queue-overview', {
        breadcrumbs: req.breadcrumbs(),
        sbQueueInfo,
        saQueueInfo: storageQueueInfo
      })
    } catch (error) {
      return next(error)
    }
  },

  getClearServiceBusQueue: async function getClearServiceBusQueue (req, res, next, error = new ValidationError()) {
    try {
      const queueName = req.params.queueName
      if (!queueName) {
        res.redirect('/tech-support/queue-overview')
      }
      const title = `Clear Service Bus Queue: ${queueName}`
      req.breadcrumbs('Queue Overview', '/tech-support/queue-overview')
      req.breadcrumbs(title)
      res.locals.pageTitle = title
      res.render('tech-support/queue-purge-confirm', {
        breadcrumbs: req.breadcrumbs(),
        queueName,
        err: error || new ValidationError()
      })
    } catch (error) {
      return next(error)
    }
  },

  postClearServiceBusQueue: async function postClearServiceBusQueue (req, res, next) {
    try {
      const confirmedQueueName = req.body.confirmedQueueName
      const queueName = req.params.queueName
      if (confirmedQueueName !== queueName) {
        const validationError = new ValidationError()
        validationError.addError('confirmedQueueName', 'Queue name does not match')
        return controller.getClearServiceBusQueue(req, res, next, validationError)
      }
      await queueMgmtService.clearServiceBusQueue(queueName)
      res.redirect('/tech-support/queue-overview')
    } catch (error) {
      return next(error)
    }
  },

  getCheckResultsResyncCheck: async function getCheckResultsResyncCheck (req, res, next, error = new ValidationError()) {
    try {
      res.locals.pageTitle = 'Check Results - Resync Check'
      req.breadcrumbs('Resync Single Check')
      res.render('tech-support/results-resync-check', {
        breadcrumbs: req.breadcrumbs(),
        error,
        checkCode: req.body?.checkCode ?? '',
        err: error || new ValidationError(),
        response: ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postCheckResultsResyncCheck: async function postCheckResultsResyncCheck (req, res, next) {
    res.locals.pageTitle = 'Check Results - Resync Check'
    const checkCode = req.body.checkCode?.trim()
    try {
      const validationError = uuidValidator.validate(checkCode, 'checkCode')
      if (validationError && validationError.hasError && validationError.hasError()) {
        return controller.getCheckResultsResyncCheck(req, res, next, validationError)
      }
      await resultsResyncService.resyncSingleCheck(checkCode)
      req.breadcrumbs('Resync Single Check')
      res.render('tech-support/results-resync-check', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          checkCode
        },
        response: 'request sent to function API successfully'
      })
    } catch (error) {
      return next(error)
    }
  },

  getCheckResultsResyncSchool: async function getCheckResultsResyncSchool (req, res, next, error = new ValidationError()) {
    try {
      res.locals.pageTitle = 'Resync School Results'
      req.breadcrumbs('Check Results - Resync School')
      res.render('tech-support/results-resync-school', {
        breadcrumbs: req.breadcrumbs(),
        error,
        schoolUuid: req.body?.schoolUuid ?? '',
        err: error || new ValidationError(),
        response: ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postCheckResultsResyncSchool: async function postCheckResultsResyncSchool (req, res, next) {
    res.locals.pageTitle = 'Resync School Results'
    const schoolUuid = req.body.schoolUuid?.trim()
    try {
      const validationError = uuidValidator.validate(schoolUuid, 'schoolUuid')
      if (validationError && validationError.hasError && validationError.hasError()) {
        return controller.getCheckResultsResyncSchool(req, res, next, validationError)
      }
      await resultsResyncService.resyncChecksForSchool(schoolUuid)
      req.breadcrumbs('Check Results - Resync School')
      res.render('tech-support/results-resync-school', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          schoolUuid
        },
        response: 'request sent to function API successfully'
      })
    } catch (error) {
      return next(error)
    }
  },

  getCheckResultsResyncAll: async function getCheckResultsResyncAll (req, res, next, error = new ValidationError()) {
    try {
      res.locals.pageTitle = 'Resync All Results'
      req.breadcrumbs('Check Results - Resync All')
      res.render('tech-support/results-resync-all', {
        breadcrumbs: req.breadcrumbs(),
        error,
        resyncAll: req.body?.resyncAll ?? false,
        err: error || new ValidationError(),
        response: ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postCheckResultsResyncAll: async function postCheckResultsResyncAll (req, res, next) {
    res.locals.pageTitle = 'Synchronise new checks from Table Storage to main SQL database'
    const resyncAll = req.body.resyncAll === 'true' // convert string to bool- the user must tick the checkbox
    try {
      await resultsResyncService.resyncAllChecks(resyncAll)
      req.breadcrumbs('Check Results - Resync All')
      res.render('tech-support/results-resync-all', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          resyncAll
        },
        response: 'request sent to function API successfully'
      })
    } catch (error) {
      return next(error)
    }
  },

  getPsReportRun: async function getPsReportRun (req, res, next) {
    try {
      res.locals.pageTitle = 'PS Report Run'
      req.breadcrumbs('PS Report Run')
      res.render('tech-support/ps-report-run', {
        breadcrumbs: req.breadcrumbs(),
        runReport: req.body?.runReport ?? 'false',
        response: ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postPsReportRun: async function postPsReportRun (req, res, next) {
    const response = req.body.runReport === 'true' ? 'PS Report Requested' : 'Report NOT Requested - checkbox tick required'
    res.locals.pageTitle = 'PS Report Run'
    try {
      if (req.body.runReport === 'true') {
        await PsReportExecService.requestReportGeneration(req.user.id, req.body.urns)
      }
      req.breadcrumbs('PS Report Run')
      res.render('tech-support/ps-report-run', {
        breadcrumbs: req.breadcrumbs(),
        formData: {
          runReport: req.body.runReport
        },
        response
      })
    } catch (error) {
      return next(error)
    }
  },

  getCheckSubmit: async function getCheckSubmit (req, res, next) {
    try {
      res.locals.pageTitle = 'Submit Check'
      req.breadcrumbs('Submit Check')
      res.render('tech-support/check-submit', {
        breadcrumbs: req.breadcrumbs(),
        response: ''
      })
    } catch (error) {
      return next(error)
    }
  },

  postCheckSubmit: async function postCheckSubmit (req, res, next) {
    res.locals.pageTitle = 'Submit Check'
    try {
      await CheckSubmitService.submitV3CheckPayload(req.body.isJson, req.body.payload)
      req.breadcrumbs('Submit Check')
      res.render('tech-support/check-submit', {
        breadcrumbs: req.breadcrumbs(),
        formData: {
          payload: req.body.payload,
          isJson: req.body.isJson
        },
        response: 'check submitted to service bus successfully'
      })
    } catch (error) {
      return next(error)
    }
  },

  getSbQueueSubmit: async function getSbQueueSubmit (req, res, next) {
    try {
      req.breadcrumbs('Submit Service Bus Queue Message')
      res.locals.pageTitle = 'Submit Service Bus Queue Message'
/*    does not work...
      res.locals.isSubmitMetaRedirectUrl = true
      res.locals.waitTimeBeforeMetaRedirectInSeconds = 30
      res.locals.metaRedirectUrl = `/tech-support/sb-queue-submit` */
      res.render('tech-support/sb-queue-submit', {
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      return next(error)
    }
  },

  postSbQueueSubmit: async function postSbQueueSubmit (req, res, next) {
    res.locals.pageTitle = 'Submit Service Bus Queue Message'
    try {
      await queueMgmtService.sendServiceBusQueueMessage(req.body.queueName, req.body.message, req.body.contentType)
      return res.redirect('/tech-support/queue-overview')
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = controller
