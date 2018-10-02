let DateValidationData = class {
  day (day) {
    this.day = day
    return this
  }
  month (month) {
    this.month = month
    return this
  }
  year (year) {
    this.year = year
    return this
  }
  dayHTMLAttributeId (dayHTMLAttributeId) {
    this.dayHTMLAttributeId = dayHTMLAttributeId
    return this
  }
  monthHTMLAttributeId (monthHTMLAttributeId) {
    this.monthHTMLAttributeId = monthHTMLAttributeId
    return this
  }
  yearHTMLAttributeId (yearHTMLAttributeId) {
    this.yearHTMLAttributeId = yearHTMLAttributeId
    return this
  }
  wrongDayMessage (wrongDayMessage) {
    this.wrongDayMessage = wrongDayMessage
    return this
  }
  wrongMonthMessage (wrongMonthMessage) {
    this.wrongMonthMessage = wrongMonthMessage
    return this
  }
  wrongYearMessage (wrongYearMessage) {
    this.wrongYearMessage = wrongYearMessage
    return this
  }
  dayInvalidChars (dayInvalidChars) {
    this.dayInvalidChars = dayInvalidChars
    return this
  }
  monthInvalidChars (monthInvalidChars) {
    this.monthInvalidChars = monthInvalidChars
    return this
  }
  yearInvalidChars (yearInvalidChars) {
    this.yearInvalidChars = yearInvalidChars
    return this
  }
  dateInThePast (dateInThePast) {
    this.dateInThePast = dateInThePast
    return this
  }
}

module.exports = DateValidationData
