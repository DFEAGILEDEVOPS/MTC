'use strict'

const monitor = require('../helpers/monitor')

const sortingAttributesService = {
  /**
   * Flexible sorting service.
   * @param sortingOptions
   * @param sortField
   * @param sortDirection
   * @returns {*}
   */
  getAttributes: (sortingOptions, sortField, sortDirection) => {
    if (!sortingOptions) {
      return false
    }

    let htmlSortDirection = []
    let arrowSortDirection = []

    sortingOptions.map((sd, index) => {
      if (sd.key === sortField) {
        htmlSortDirection[sd.key] = (sortDirection === 'asc' ? 'desc' : 'asc')
        arrowSortDirection[sd.key] = (htmlSortDirection[sd.key] === 'asc' ? 'sort up' : 'sort')
      } else {
        htmlSortDirection[sd.key] = 'asc'
        arrowSortDirection[sd.key] = 'sort'
      }
    })
    return {
      htmlSortDirection,
      arrowSortDirection
    }
  }
}

module.exports = monitor('sorting-attributes.service', sortingAttributesService)
