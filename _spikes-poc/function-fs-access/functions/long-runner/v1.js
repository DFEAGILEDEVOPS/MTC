'use strict'

let logger

function delay (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

const v1 = {
  process: async function (loggerArg) {
    logger = loggerArg
    const twoHoursInMs = 2 * 60 * 60 * 1000
    logger('Commencing delay: 2 hours')
    await delay(twoHoursInMs - 10000)
    logger('Delay complete')
  }
}

module.exports = v1
