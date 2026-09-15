'use strict'

const config = require('../../config')
const axios = require('axios')

const functionUrl = `${config.Functions.Throttled.BaseAdminUrl}/dlq-reconciliation`
const requestConfig = {
  headers: {
    'x-functions-key': config.Functions.Throttled.MasterKey,
    'Content-Type': 'application/json'
  }
}

const service = {
  reconcileDlq: async function reconcileDlq () {
    const response = await axios.post(functionUrl, {}, requestConfig)
    if (response.status !== 202 && response.status !== 200) {
      throw new Error(`request to ${functionUrl} failed: ${response.status} - ${response.statusText}`)
    }

    return response.data || {
      message: 'reconciliation request submitted',
      resolvedCount: 0,
      unresolvedCount: 0,
      totalCount: 0,
      verifiedChecks: []
    }
  }
}

module.exports = service
