'use strict'

const v1 = {
  process: async function process (logger) {
    try {
      console.log('do some work')
    } catch (error) {
      logger.error('ERROR: v1.process(): ' + error.message)
      throw error
    }
  }
}

module.exports = v1
