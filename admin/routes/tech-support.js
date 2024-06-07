'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const techSupportController = require('../controllers/tech-support')

router.get(
  '/home',
  isAuthenticated([roles.techSupport]),
  techSupportController.getHomePage
)

router.get(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckViewPage
)

router.post(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckViewPage
)

router.get(
  '/marked-check-json/:checkCode',
  isAuthenticated([roles.techSupport]),
  techSupportController.getJsonMarkedCheck
)

router.get(
  '/received-check-json/:checkCode',
  isAuthenticated([roles.techSupport]),
  techSupportController.getJsonReceivedCheck
)

router.get(
  '/received-check-payload',
  isAuthenticated([roles.techSupport]),
  techSupportController.getReceivedCheckPayload
)

router.get(
  '/redis-overview',
  isAuthenticated([roles.techSupport]),
  techSupportController.showRedisOverview
)

router.get(
  '/redis/drop/:redisKey?',
  isAuthenticated([roles.techSupport]),
  techSupportController.getRedisDropKeyPage
)

router.post(
  '/redis/drop/confirm',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisDropKeyConfirm
)

router.get(
  '/redis/drop/confirm/:redisKey',
  isAuthenticated([roles.techSupport]),
  techSupportController.getRedisDropKeyConfirm
)

router.post(
  '/redis/drop',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisDropKey
)

router.get(
  '/redis/search',
  isAuthenticated([roles.techSupport]),
  techSupportController.getRedisSearchKey
)

router.post(
  '/redis/search',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisSearchKey
)

router.get(
  '/redis/examine/:key?',
  isAuthenticated([roles.techSupport]),
  techSupportController.getExamineRedisKey
)

router.get(
  '/redis/multiple/drop',
  isAuthenticated([roles.techSupport]),
  techSupportController.getRedisBatchDropPage
)

router.post(
  '/redis/multiple/drop',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisBatchDrop
)

router.post(
  '/redis/multiple/drop/confirm',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisBatchDropRedirectToConfirmPage
)

router.get(
  '/redis/multiple/drop/confirm',
  isAuthenticated([roles.techSupport]),
  techSupportController.postRedisBatchDropConfirmPage
)

router.get(
  '/queue-overview',
  isAuthenticated([roles.techSupport]),
  techSupportController.showQueueOverview
)

router.get(
  '/clear-service-bus-queue/:queueName',
  isAuthenticated([roles.techSupport]),
  techSupportController.getClearServiceBusQueue)

router.post(
  '/clear-service-bus-queue/:queueName',
  isAuthenticated([roles.techSupport]),
  techSupportController.postClearServiceBusQueue)

router.get(
  '/results-resync-check',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckResultsResyncCheck
)

router.post(
  '/results-resync-check',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckResultsResyncCheck
)

router.get(
  '/results-resync-school',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckResultsResyncSchool
)

router.post(
  '/results-resync-school',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckResultsResyncSchool
)

router.get(
  '/results-resync-all',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckResultsResyncAll
)

router.post(
  '/results-resync-all',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckResultsResyncAll
)

router.get(
  '/ps-report-run',
  isAuthenticated([roles.techSupport]),
  techSupportController.getPsReportRun
)

router.post(
  '/ps-report-run',
  isAuthenticated([roles.techSupport]),
  techSupportController.postPsReportRun
)

router.get(
  '/check-submit',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckSubmit
)

router.post(
  '/check-submit',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckSubmit
)

module.exports = router
