export interface ICheckValidator {
  validate (): void
}

export interface ITableService {}
class TableService {}

export interface IStorageHelper {
  getPromisifiedAzureTableService (): ITableService
}

export class StorageHelper implements IStorageHelper {
  getPromisifiedAzureTableService (): ITableService {
    return new TableService()
  }
}

export class CheckValidatorV1 implements ICheckValidator {
  private _storageHelper: IStorageHelper
  constructor (storageHelper?: IStorageHelper) {
    if (storageHelper !== undefined) {
      this._storageHelper = storageHelper
    } else {
      this._storageHelper = new StorageHelper()
    }
  }

  validate (): void {
    return
  }
}
