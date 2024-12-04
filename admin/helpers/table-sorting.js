const numericOnlyPattern = /^\d+$/
const numericOnlyRegExp = new RegExp(numericOnlyPattern)
const R = require('ramda')

const firstTruthy = ([head, ...tail]) => R.reduce(R.either, head, tail)
// @ts-ignore ramda doesnt work well with types
const makeComparator = (propName) => R.comparator((a, b) => R.lt(R.prop(propName, a), R.prop(propName, b)))
const sortByProps = (props, list) => R.sort(firstTruthy(R.map(makeComparator, props)), list)

const tableSorting = {

  /**
   * Sort a list of objects based on a field
   * @deprecated
   * @param {Array} tableData
   * @param {String} field
   * @param {Boolean} asc
   * @returns {Array} sorted array data
   */
  applySorting: function (tableData, field, asc = true) {
    return tableData.sort((a, b) => this.comparer(a[field], b[field], asc))
  },

  /**
   * @deprecated
   * @param v1
   * @param v2
   * @param asc
   * @return {*}
   */
  comparer: function (v1, v2, asc) {
    return this.isNumericValue(v1) && this.isNumericValue(v2) ?
      this.getNumberComparisonResult(v1, v2, asc) :
      this.getStringComparisonResult(v1, v2, asc)
  },

  /**
   * @deprecated
   * @param v
   * @return {boolean}
   */
  isNumericValue: function (v) {
    return ((typeof v === 'string' && numericOnlyRegExp.test(v)) || typeof v === 'number')
  },

  /**
   * @deprecated
   * @param a
   * @param b
   * @param asc
   * @return {number}
   */
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

  /**
   * @deprecated
   * @param a
   * @param b
   * @param asc
   * @return {number}
   */
  getNumberComparisonResult: function (a, b, asc) {
    return asc ? a - b : b - a
  },

  /**
   * @deprecated
   * @param v
   * @return {boolean}
   */
  isEmpty: function (v) {
    if ((v === undefined || v === null || v === '')) {
      return true
    }
  },

  /**
   * Return a sorted copy of the array.
   * Sort a List by array of props (if first prop equivalent, sort by second, etc.)
   * E.g.sortByProps(["a","b","c"], [{a:1,b:2,c:3}, {a:10,b:10,c:10}, {a:10,b:6,c:0}, {a:1, b:2, c:1}, {a:100}])
   * => [{"a":1,"b":2,"c":1},{"a":1,"b":2,"c":3},{"a":10,"b":6,"c":0},{"a":10,"b":10,"c":10},{"a":100}]
   */
  sortByProps

}

module.exports = tableSorting
