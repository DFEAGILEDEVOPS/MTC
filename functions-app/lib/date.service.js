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
  },

  formatIso8601: function (momentDate) {
    if (!moment.isMoment(momentDate)) {
      throw new Error('Parameter must be of type Moment')
    }
    if (!momentDate.isValid()) {
      throw new Error('Not a valid date')
    }
    return momentDate.format(iso8601WithMsPrecisionAndTimeZone)
  },

  /**
   * Get the number of seconds betwen two moment objects, rounded to 1 decimal place
   * @param { moment.Moment} m1
   * @param { moment.Moment } m2
   * @return { String | Number}
   */
  getDuration: require('./get-duration')
}

module.exports = dateService
