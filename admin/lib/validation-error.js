'use strict'

module.exports = class ValidationError {
  /**
   *
   * @param {String} field - the html field that is invalid
   * @param {String} message - the message to display in the GDS format just above the field
   */
  constructor (field, message) {
    this.errors = {}
    this.name = 'ValidationError'
    if (field && message) {
      this.errors[field] = message
    }
  }

  /**
   *
   * @param {String} field - the html field
   * @param {String} message - the message to display
   * @return {module.ValidationError}
   */
  addError (field, message) {
    this.errors[field] = message
    return this
  }

  /**
   *
   * @param {String} field
   * @return {boolean}
   */
  isError (field) {
    if (this.errors.hasOwnProperty(field)) {
      return true
    }
    return false
  }

  /**
   *
   * @param {String} field
   * @return {String}  - possibly empty string
   */
  get (field) {
    if (this.errors.hasOwnProperty(field)) {
      return this.errors[field]
    }
    return ''
  }

  /**
   *
   * @return {boolean}
   */
  hasError () {
    return Object.keys(this.errors).length > 0
  }

  /**
   *
   * @return {Array}
   */
  getFields () {
    return Object.keys(this.errors)
  }

  removeError (field) {
    return delete this.errors[field]
  }

  /**
   * @param {Array} sortArray - optional an array of fields in the order you want the sorted array
   * Remove duplicate errors from the output (e.g. for header summary)
   * Date of birth [day, month, year] fields are likely to all have the
   * same error message.
   */
  getUniqueFields (sortArray) {
    let hash = {}
    for (let field in this.errors) {
      hash[this.errors[field]] = field
    }
    let unique = {}
    for (let field in hash) {
      unique[hash[field]] = field
    }
    let uniqueKeys = Object.keys(unique)

    if (sortArray) {
      return ValidationError.sortByFieldOrder(uniqueKeys, sortArray)
    }
    return uniqueKeys
  }

  static sortByFieldOrder (arrayToSort, fieldOrder) {
    if (!Array.isArray(arrayToSort)) {
      throw new TypeError('arrayToSort is not an array')
    }

    if (!Array.isArray(fieldOrder)) {
      throw new TypeError('fieldOrder is not an array')
    }

    const sortedFields = []

    fieldOrder.forEach((val, idx) => {
      if (arrayToSort.indexOf(val) !== -1) {
        sortedFields.push(val)
      }
    })

    arrayToSort.forEach(val => {
      if (sortedFields.indexOf(val) === -1) {
        // We have found a key (unique field with an error) that is not specified in the sort order
        // - add it the end rather than drop it.
        sortedFields.push(val)
      }
    })

    return sortedFields
  }
}
