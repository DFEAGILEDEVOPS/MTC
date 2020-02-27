'use strict'

const axios = require('axios').default
const config = require('../../../config')

const functionUrl = config.SchoolPinGeneratorFunction.FunctionUrl

const service = {
  callFunctionApi: async (schoolUuid) => {
    const response = await axios.post(functionUrl, {
      school_uuid: schoolUuid
    })
    return response.pin
  }
}

module.exports = service
