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
  '/redis/examine/:key',
  isAuthenticated([roles.techSupport]),
  techSupportController.getExamineRedisKey
)

module.exports = router
