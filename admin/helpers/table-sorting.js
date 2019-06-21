const numericOnlyPattern = /^\d+$/
const numericOnlyRegExp = new RegExp(numericOnlyPattern)

const tableSorting = {

  /**
   * Sort a list of objects based on a field
   * @param {Array} tableData
   * @param {String} field
   * @param {Boolean} asc
   * @returns {Array} sorted array data
   */
  applySorting: function (tableData, field, asc = true) {
    return tableData.sort((a, b) => this.comparer(a[field], b[field], asc))
  },

  comparer: function (v1, v2, asc) {
    return this.isNumericValue(v1) && this.isNumericValue(v2)
      ? this.getNumberComparisonResult(v1, v2, asc) : this.getStringComparisonResult(v1, v2, asc)
  },

  isNumericValue: function (v) {
    return ((typeof v === 'string' && numericOnlyRegExp.test(v)) || typeof v === 'number')
  },

  getStringComparisonResult: function (a, b, asc) {
    if (this.isEmpty(a)) {
      return 1
    } else if (this.isEmpty(b)) {
      return -1
    } else if (a === b) {
      return 0
    } else if (asc) {
      return a.toString().localeCompare(b)
    } else if (!asc) {
      return b.toString().localeCompare(a)
    }
  },

  getNumberComparisonResult: function (a, b, asc) {
    return asc ? a - b : b - a
  },

  isEmpty: function (v) {
    if ((v === undefined || v === null || v === '')) {
      return true
    }
  }
}

module.exports = tableSorting
