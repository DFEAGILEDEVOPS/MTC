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
    const numericOnlyPattern = /^\d+$/
    const numericOnlyRegExp = new RegExp(numericOnlyPattern)
    return ((typeof v === 'string' && numericOnlyRegExp.test(v)) || typeof v === 'number')
  },

  getStringComparisonResult: function (a, b, asc) {
    if (this.isNullString(a)) {
      return 1
    } else if (this.isNullString(b)) {
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

  isNullString: function (v) {
    if ((v === undefined || v === null || v === '')) {
      return true
    }
  }
}

module.exports = tableSorting
