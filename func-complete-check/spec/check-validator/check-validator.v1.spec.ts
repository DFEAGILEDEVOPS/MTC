import * as CheckValidator from '../../check-validator/check-validator.v1'
import { IAsyncTableService } from '../../lib/storage-helper'

let sut: CheckValidator.CheckValidatorV1
const TableServiceMock = jest.fn<IAsyncTableService, any>(() => ({
  replaceEntityAsync: jest.fn(),
  queryEntitiesAsync: jest.fn(),
  deleteEntityAsync: jest.fn(),
  insertEntityAsync: jest.fn()
}))

describe('check-validator/v1', () => {
  beforeEach(() => {
    const tableServiceMock = new TableServiceMock()
    sut = new CheckValidator.CheckValidatorV1(tableServiceMock)
  })
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
