'use strict'

const config = require('../config')

const service = {
  generateSchoolPin: async (urlSlug) => {
    const functionAuthToken = config.SchoolPinGeneratorFunction.HttpAuthToken
    console.log(`make http call to function for ${urlSlug} with token ${functionAuthToken}`)
    return 'fakepin1'
  }
}

module.exports = service
