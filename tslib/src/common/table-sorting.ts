// const R = require('ramda')
import * as R from 'ramda'

// @ts-ignore ramda type support is a known problem
const firstTruthy = ([head, ...tail]): unknown => R.reduce(R.either, head, tail)
// @ts-ignore ramda type support is a known problem
const makeComparator = (propName): unknown => R.comparator((a, b) => R.lt(R.prop(propName, a), R.prop(propName, b)))

class TableSorting {
  /**
   * Return a sorted copy of the array.
   * Sort a List by array of props (if first prop equivalent, sort by second, etc.)
   * E.g.sortByProps(["a","b","c"], [{a:1,b:2,c:3}, {a:10,b:10,c:10}, {a:10,b:6,c:0}, {a:1, b:2, c:1}, {a:100}])
   * => [{"a":1,"b":2,"c":1},{"a":1,"b":2,"c":3},{"a":10,"b":6,"c":0},{"a":10,"b":10,"c":10},{"a":100}]
   */
  sortByProps<T> (props: string[], data: T[]): T[] {
    // @ts-ignore ramda type support is limited
    return R.sort(firstTruthy(R.map(makeComparator, props)), data)
  }
}

export default new TableSorting()
