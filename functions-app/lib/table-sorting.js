const R = require('ramda')

const firstTruthy = ([head, ...tail]) => R.reduce(R.either, head, tail)
const makeComparator = (propName) => R.comparator((a, b) => R.lt(R.prop(propName, a), R.prop(propName, b)))
const sortByProps = (props, list) => R.sort(firstTruthy(R.map(makeComparator, props)), list)

const tableSorting = {
  /**
   * Return a sorted copy of the array.
   * Sort a List by array of props (if first prop equivalent, sort by second, etc.)
   * E.g.sortByProps(["a","b","c"], [{a:1,b:2,c:3}, {a:10,b:10,c:10}, {a:10,b:6,c:0}, {a:1, b:2, c:1}, {a:100}])
   * => [{"a":1,"b":2,"c":1},{"a":1,"b":2,"c":3},{"a":10,"b":6,"c":0},{"a":10,"b":10,"c":10},{"a":100}]
   */
  sortByProps

}

module.exports = tableSorting
