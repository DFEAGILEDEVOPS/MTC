export class SchoolRecordMapper {
  /**
   * Return a domain-mapped object from a
   * @param {Array} row - csv row as array ['1001', 'Sometown Primary school', 'csv', 'array', ... ]
   * @param {Object} mapping - mapping object { urn: 0, name: 1, ... }
   * @return {Object} - mapped object of string values E.g. { urn: '1001', 'name': 'Sometown Primary School' ... }
   */
  mapRow (row: Array<string | number>, mapping: any): object {
    const o: any = {}
    Object.keys(mapping).forEach(k => {
      o[k] = row[mapping[k]]
    })
    return o
  }
}
