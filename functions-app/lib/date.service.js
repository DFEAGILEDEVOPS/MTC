'use strict'

const moment = require('moment')

const dateService = {
  /**
   * Return a moment object from a valid ISO string timestamp in the exact required format; undefined otherwise.
   * @param stringTs
   * @return {moment.Moment|undefined}
   */
  convertIsoStringToMoment: (stringTs) => {
    const format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
    try {
      const mts = moment.utc(stringTs, format, true)
      if (!mts.isValid()) {
        return
      }
      return mts
    } catch (ignore) {}
  }
}

module.exports = dateService
