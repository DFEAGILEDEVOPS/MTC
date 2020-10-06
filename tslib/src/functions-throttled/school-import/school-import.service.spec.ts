/* global describe, it, expect */

import { SchoolImportService } from './school-import.service'
import { ConnectionPool } from 'mssql'
import config from '../../config'
import { SchoolImportJobResult } from './ISchoolImportJobResult'
import { ISchoolDataService } from './data-access/school.data.service'

let sut: SchoolImportService
let jobResult: SchoolImportJobResult
let schoolDataServiceMock: ISchoolDataService

const SchoolDataServiceMock = jest.fn<ISchoolDataService, any>(() => ({
  bulkUpload: jest.fn(),
  getMappedData: jest.fn(),
  isPredicated: jest.fn()
}))

describe('#SchoolImportService', () => {

  beforeEach(() => {
    schoolDataServiceMock = new SchoolDataServiceMock()
    jobResult = new SchoolImportJobResult()
    sut = new SchoolImportService(new ConnectionPool(config.Sql), jobResult, schoolDataServiceMock)
  })

  it('is defined', () => {
    expect(sut).toBeInstanceOf(SchoolImportService)
  })

  it('has a process function', () => {
    expect(sut.process).toBeDefined()
  })

  describe('#mapColums', () => {
    it('is defined', () => {
      expect(sut.mapColumns).toBeDefined()
    })

    it('return the column index for the desired columns', () => {
      const headerRow = ['Row A', 'ROW (B)', 'Stuff', '&', 'Nonsense', 'Row ("C")']
      const desiredRows = [
        ['Row A', 'rowA'],
        ['ROW (B)', 'rowB'],
        ['Row ("C")', 'rowC']
      ]
      const mapping = sut.mapColumns(headerRow, desiredRows)
      expect(mapping).toEqual({
        rowA: 0,
        rowB: 1,
        rowC: 5
      })
    })

    it('throws an error with all the headers it cant find', () => {
      const headerRow = ['a', 'b', 'c']
      const desiredRows = [
        ['d', 'd'],
        ['e', 'e'],
        ['f', 'f']
      ]
      expect(() => { sut.mapColumns(headerRow, desiredRows) }).toThrowError('Headers "d", "e", "f" not found')
    })
  })
})
