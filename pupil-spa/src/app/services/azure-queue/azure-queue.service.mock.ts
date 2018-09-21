import { Injectable } from '@angular/core';

@Injectable()
export class AzureQueueServiceMock {
  public getTableService() {
    return {
      insertEntity: (tableName, message, cb) => { cb(); }
    };
  }
}
