
/**
 * Creates date validation data based on parameters
 */
const DateValidationData = class {
  /**
   * @param {String} day displayed in two digits
   * @returns {any}
   */
  day (day) {
    this.day = day
    return this
  }

  /**
   * @param {String} month displayed in two digits
   * @returns {Object}
   */
  month (month) {
    this.month = month
    return this
  }

  /**
   * @param {String} year displayed in four digits
   * @returns {Object}
   */
  year (year) {
    this.year = year
    return this
  }

  /**
   * @param {String} dayHTMLAttributeId - element id containing the day
   * @returns {Object}
   */
  dayHTMLAttributeId (dayHTMLAttributeId) {
    this.dayHTMLAttributeId = dayHTMLAttributeId
    return this
  }

  /**
   * @param {String} monthHTMLAttributeId - element id containing the month
   * @returns {Object}
   */
  monthHTMLAttributeId (monthHTMLAttributeId) {
    this.monthHTMLAttributeId = monthHTMLAttributeId
    return this
  }

  /**
   * @param {String} yearHTMLAttributeId - element id containing the year
   * @returns {Object}
   */
  yearHTMLAttributeId (yearHTMLAttributeId) {
    this.yearHTMLAttributeId = yearHTMLAttributeId
    return this
  }

  /**
   * @param {String} wrongDayMessage - message for wrong day
   * @returns {Object}
   */
  wrongDayMessage (wrongDayMessage) {
    this.wrongDayMessage = wrongDayMessage
    return this
  }

  /**
   * @param {String} wrongMonthMessage - message for wrong month
   * @returns {Object}
   */
  wrongMonthMessage (wrongMonthMessage) {
    this.wrongMonthMessage = wrongMonthMessage
    return this
  }

  /**
   * @param {String} wrongYearMessage - message for wrong year
   * @returns {Object}
   */
  wrongYearMessage (wrongYearMessage) {
    this.wrongYearMessage = wrongYearMessage
    return this
  }

  /**
   * @param {String} dayInvalidChars - message for invalid chars on day field
   * @returns {Object}
   */
  dayInvalidChars (dayInvalidChars) {
    this.dayInvalidChars = dayInvalidChars
    return this
  }

  /**
   * @param {String} monthInvalidChars - message for invalid chars on month field
   * @returns {Object}
   */
  monthInvalidChars (monthInvalidChars) {
    this.monthInvalidChars = monthInvalidChars
    return this
  }

  /**
   * @param {String} yearInvalidChars - message for invalid chars on year field
   * @returns {Object}
   */
  yearInvalidChars (yearInvalidChars) {
    this.yearInvalidChars = yearInvalidChars
    return this
  }

  /**
   * @param {String} dateInThePast - message in case date is in the past
   * @returns {Object}
   */
  dateInThePast (dateInThePast) {
    this.dateInThePast = dateInThePast
    return this
  }
}

module.exports = DateValidationData
