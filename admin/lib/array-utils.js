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
  }
}
