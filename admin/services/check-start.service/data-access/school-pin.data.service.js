'use strict'

const axios = require('axios').default
const config = require('../../../config')

const functionUrl = config.SchoolPinGeneratorFunction.FunctionUrl

const service = {
  callFunctionApi: async (schoolId) => {
    const response = await axios.post(functionUrl, {
      school_id: schoolId
    })
    if (response.status === 200) {
      return response.data.pin
    } else {
      throw new Error(`non 200 status code returned. ${response.status}:${response.statusText}`)
    }
  }
}

module.exports = service
