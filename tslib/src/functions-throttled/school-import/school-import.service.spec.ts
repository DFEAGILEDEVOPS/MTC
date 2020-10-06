/* global describe, it, expect */

import { SchoolImportService } from './school-import.service'
import { ConnectionPool } from 'mssql'
import config from '../../config'
import { SchoolImportJobResult } from './SchoolImportJobResult'
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

  test.todo('implementation')
})
