'use strict'

const config = require('../../config')
const axios = require('axios')

const functionUrl = new URL(config.Functions.Throttled.BaseAdminUrl)
functionUrl.pathname = `${functionUrl.pathname.replace(/\/admin\/functions\/?$/, '')}/api/dlq-reconciliation`
const requestConfig = {
  headers: {
    'x-functions-key': config.Functions.Throttled.MasterKey,
    'Content-Type': 'application/json'
  }
}

const service = {
  startRun: async function startRun (mode, requestedBy, previewRunId) {
    const response = await axios.post(functionUrl.toString(), { mode, requestedBy, previewRunId }, { ...requestConfig, timeout: 210000 })
    if (response.status !== 200) throw new Error('Reconciliation run did not return a result')
    return response.data
  },

  getRun: async function getRun (runId, page = 1) {
    const response = await axios.get(functionUrl.toString(), { ...requestConfig, params: { runId, page } })
    return response.data
  },

  listRuns: async function listRuns () {
    const response = await axios.get(functionUrl.toString(), requestConfig)
    return response.data.runs
  }
}

module.exports = service
