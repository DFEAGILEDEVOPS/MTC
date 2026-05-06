import { SchoolRecordMapper } from './school-mapper'
import * as csv from 'csv-string'

let sut: SchoolRecordMapper

describe('SchoolDataService', () => {
  beforeEach(() => {
    sut = new SchoolRecordMapper()
  })

  test('should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolRecordMapper)
  })

  test('returns a mapped object with keys as per the mapping object', () => {
    const row = ['Town Primary School', '123456', 'extra', 'data', '9991111']
    const mapping = {
      name: 0,
      urn: 1
    }
    const mappedRecord = sut.mapRow(row, mapping)
    expect(mappedRecord.urn).toBe(123456)
    expect(mappedRecord.name).toBe('Town Primary School')
  })

  test('returns the column index for the desired columns', () => {
    const headerRow = ['Row A', 'ROW (B)', 'Stuff', '&', 'Nonsense', 'Row ("C")']
    const desiredRows = [
      ['Row A', 'rowA'],
      ['ROW (B)', 'rowB'],
      ['Row ("C")', 'rowC']
    ]
    const mapping = sut.mapColumns(headerRow, desiredRows)
    expect(mapping).toStrictEqual({
      rowA: 0,
      rowB: 1,
      rowC: 5
    })
  })

  test('throws an error with all the headers it cant find', () => {
    const headerRow = ['a', 'b', 'c']
    const desiredRows = [
      ['d', 'd'],
      ['e', 'e'],
      ['f', 'f']
    ]
    expect(() => { sut.mapColumns(headerRow, desiredRows) }).toThrow('Headers "d", "e", "f" not found')
  })

  test('mapRow is returning object with correct types', () => {
    const data = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code)
    99900,999,9000,Guys School 1,8,10,1,7,4
    99901,999,9001,Guys Closed School,8,10,2,7,4`
    const map = [
      ['URN', 'urn'],
      ['LA (code)', 'leaCode'],
      ['EstablishmentNumber', 'estabCode'],
      ['EstablishmentName', 'name'],
      ['StatutoryLowAge', 'statLowAge'],
      ['StatutoryHighAge', 'statHighAge'],
      ['EstablishmentStatus (code)', 'estabStatusCode'],
      ['TypeOfEstablishment (code)', 'estabTypeCode'],
      ['EstablishmentTypeGroup (code)', 'estabTypeGroupCode']
    ]
    const csvParsed = csv.parse(data)
    const dataWithoutHeader = csvParsed.shift()
    if (dataWithoutHeader === undefined) {
      fail('no data')
    }
    const mapping = sut.mapColumns(dataWithoutHeader, map)
    const mappedRow = sut.mapRow(csvParsed[0], mapping)
    expect(mappedRow.estabTypeGroupCode).toBe(4)
  })
})
