
export interface CheckAllocationDataService {
}

export class CheckAllocationService {
  private dataService: CheckAllocationDataService
  constructor (dataService: CheckAllocationDataService) {
    this.dataService = dataService
  }
}
