import { IAsyncTableService, AsyncTableService } from '../lib/storage-helper'

export interface ICheckValidator {
  validate (): void
}

export class CheckValidatorV1 implements ICheckValidator {
  private _tableService: IAsyncTableService
  constructor (tableService?: IAsyncTableService) {
    if (tableService !== undefined) {
      this._tableService = tableService
    } else {
      this._tableService = new AsyncTableService()
    }
  }

  validate (): void {
    return
  }
}
