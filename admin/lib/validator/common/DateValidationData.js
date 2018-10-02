/**
 * Creates date validation data based on parameters
 */
const DateValidationData = class {
  /**
   * @param {String} day
   * @returns {Object}
   */
  day (day) {
    this.day = day
    return this
  }

  /**
   * @param {String} month
   * @returns {Object}
   */
  month (month) {
    this.month = month
    return this
  }

  /**
   * @param {String} year
   * @returns {Object}
   */
  year (year) {
    this.year = year
    return this
  }

  /**
   * @param {String} dayHTMLAttributeId
   * @returns {Object}
   */
  dayHTMLAttributeId (dayHTMLAttributeId) {
    this.dayHTMLAttributeId = dayHTMLAttributeId
    return this
  }

  /**
   * @param {String} monthHTMLAttributeId
   * @returns {Object}
   */
  monthHTMLAttributeId (monthHTMLAttributeId) {
    this.monthHTMLAttributeId = monthHTMLAttributeId
    return this
  }

  /**
   * @param {String} yearHTMLAttributeId
   * @returns {Object}
   */
  yearHTMLAttributeId (yearHTMLAttributeId) {
    this.yearHTMLAttributeId = yearHTMLAttributeId
    return this
  }

  /**
   * @param {String} wrongDayMessage
   * @returns {Object}
   */
  wrongDayMessage (wrongDayMessage) {
    this.wrongDayMessage = wrongDayMessage
    return this
  }

  /**
   * @param {String} wrongMonthMessage
   * @returns {Object}
   */
  wrongMonthMessage (wrongMonthMessage) {
    this.wrongMonthMessage = wrongMonthMessage
    return this
  }

  /**
   * @param {String} wrongYearMessage
   * @returns {Object}
   */
  wrongYearMessage (wrongYearMessage) {
    this.wrongYearMessage = wrongYearMessage
    return this
  }

  /**
   * @param {String} dayInvalidChars
   * @returns {Object}
   */
  dayInvalidChars (dayInvalidChars) {
    this.dayInvalidChars = dayInvalidChars
    return this
  }

  /**
   * @param {String} monthInvalidChars
   * @returns {Object}
   */
  monthInvalidChars (monthInvalidChars) {
    this.monthInvalidChars = monthInvalidChars
    return this
  }

  /**
   * @param {String} yearInvalidChars
   * @returns {Object}
   */
  yearInvalidChars (yearInvalidChars) {
    this.yearInvalidChars = yearInvalidChars
    return this
  }

  /**
   * @param {String} dateInThePast
   * @returns {Object}
   */
  dateInThePast (dateInThePast) {
    this.dateInThePast = dateInThePast
    return this
  }
}

module.exports = DateValidationData
