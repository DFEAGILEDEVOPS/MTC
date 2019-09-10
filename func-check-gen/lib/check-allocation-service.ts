import { ICheckAllocationDataService } from './data-access/check-allocation-data-service'
import { CommonLogger } from '../typings/types'

export class CheckAllocationService {
  private dataService: ICheckAllocationDataService
  constructor (dataService: ICheckAllocationDataService) {
    this.dataService = dataService
  }

  allocate (logger: CommonLogger): void {

  }
}
