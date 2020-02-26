'use strict'
const csv = require('csv-string')
const schoolDataService = require('./service/data-access/school.data.service')
const name = 'school-import'

const schoolImport = {

  async process (context, blob) {
    context.log.verbose('school-import.v1.process() called')
    const csvParsed = csv.parse(blob.toString())
    const mapper = [
      ['URN', 'urn'],
      ['LA (code)', 'leaCode'],
      ['EstablishmentNumber', 'estabCode'],
      ['EstablishmentName', 'name'],
      ['StatutoryLowAge', 'statLowAge'],
      ['StatutoryHighAge', 'statHighAge'],
      ['EstablishmentStatus (code)', 'estabStatusCode']
    ]
    // mapColumns() will throw if it can't find the headers it needs
    const mapping = this.mapColumns(csvParsed.shift(), mapper)
    context.log.verbose(`${name} mapping `, mapping)
    const jobResult = await schoolDataService.bulkUpload(context, csvParsed, mapping)
    context.log.verbose(`${name}  bulkUpload complete`)
    this.exportJobResults(context, jobResult)
    context.log.verbose(`${name} job results exported`)
    const meta = { linesProcessed: jobResult.linesProcessed, processCount: jobResult.schoolsLoaded }
    return meta
  },

  /**
   * Find the array indexes we need out of the entire CSV
   * @param {string[]} cols - Header row of csv file as an array of strings
   * @param {Array<[header, key]>} headers - array of pairs
   *                               where each pair is the col name to search for in the header row and the object
   *                               key to return.
   * @return {key: number, ...}    Return obj with the index of the desired columns to use mapped to the keys provided
   */
  mapColumns (cols, headers) {
    const quote = (s) => `"${s}"`
    const quoteAndJoin = (ary) => { return ary.map(quote).join(', ') }
    const mapping = {}
    const missingHeaders = []

    headers.forEach(pair => {
      const n = cols.indexOf(pair[0])
      if (n === -1) {
        missingHeaders.push(pair[0])
      } else {
        mapping[pair[1]] = n
      }
    })
    if (missingHeaders.length > 0) {
      throw new Error('Headers ' + quoteAndJoin(missingHeaders) + ' not found')
    }
    return mapping
  },

  exportJobResults (context, jobResult) {
    if (Array.isArray(jobResult.stdout) && jobResult.stdout.length > 0) {
      context.bindings.schoolImportStdout = jobResult.stdout.join('\n')
    }
  }
}

module.exports = schoolImport
