const R = require('ramda')

module.exports = {
  /**
   * Return true if the array is comprised only of empty elements, false otherwise
   * @param {Array} data
   * @return Boolean
   */
  isEmptyArray: function (data) {
    return R.all(R.isEmpty)(data)
  },

  /**
   * Remove empty arrays from an array of arrays
   * @param data
   * @return {Array}
   */
  omitEmptyArrays: function (data) {
    const output = []
    for (let ary of data) {
      if (this.isEmptyArray(ary)) {
        continue
      }
      output.push(ary)
    }
    return output
  },

  /**
   * Count arrays (of strings) in an array that fail the isEmptyArray() check
   * @param {Array} dataSet Array of Arrays of strings
   * @return {number}
   */
  countNonEmptyRows: function (dataSet) {
    if (!Array.isArray(dataSet)) {
      throw new Error('dataSet is not an Array')
    }
    return R.reduce((accumulator, data) => {
      if (this.isEmptyArray(data)) {
        // Array with nothing in the elements; we expect strings here
        // ['', '', '', '', '', '']
        return accumulator
      }

      return accumulator + 1
    }, 0, dataSet)
  }
}
