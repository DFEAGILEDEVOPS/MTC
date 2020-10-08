import { ISchoolRecord } from './data-access/ISchoolRecord'

export class SchoolRecordMapper {

  /**
   * Return a domain-mapped object from a
   * @param {Array<string | number>} row - csv row as array ['1001', 'Sometown Primary school', 'csv', 'array', ... ]
   * @param {Object} mapping - mapping object { urn: 0, name: 1, ... }
   * @return {ISchoolRecord} - mapped object of string values E.g. { urn: '1001', 'name': 'Sometown Primary School' ... }
   */
  mapRow (row: Array<any>, csvMapping: any): ISchoolRecord {
    const o: any = {}
    Object.keys(csvMapping).forEach(k => {
      const mappingValue = row[csvMapping[k]]
      if (!isNaN(mappingValue)) {
        o[k] = Number(mappingValue)
      } else {
        o[k] = mappingValue
      }
    })
    return o
  }

  mapRow2 (row: Array<string | number>, mapping: any): ISchoolRecord {
    const rec: ISchoolRecord = {
      estabCode: 1,
      estabStatusCode: 1,
      estabTypeCode: 1,
      estabTypeGroupCode: 1,
      leaCode: 1,
      name: 'x',
      urn: 1,
      statHighAge: 1,
      statLowAge: 1
    }
    return rec
  }

  /**
   * Find the array indexes we need out of the entire CSV
   * @param {string[]} cols - Header row of csv file as an array of strings
   * @param {Array<[header, key]>} headers - array of pairs
   *                               where each pair is the col name to search for in the header row and the object
   *                               key to return.
   * @return {key: number, ...}    Return obj with the index of the desired columns to use mapped to the keys provided
   */
  mapColumns (cols: Array<string>, headers: any) {
    const quote = (s: string) => `"${s}"`
    const quoteAndJoin = (ary: Array<any>) => { return ary.map(quote).join(', ') }
    const mapping: any = {}
    const missingHeaders = new Array<any>()

    headers.forEach((pair: any) => {
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
  }
}
