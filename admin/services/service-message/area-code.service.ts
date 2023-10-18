import { ServiceMessageAreaCodeDataService } from './area-code.data.service'
const sort = require('../../helpers/table-sorting')

export interface IAreaCode {
  code: string
  description: string
}

export class ServiceMessageAreaCodeService {
  public static async getAreaCodes (): Promise<IAreaCode[]> {
    const areaCodes = await ServiceMessageAreaCodeDataService.sqlGetAreaCodes()
    const sortedCodes = sort.sortByProps(['description'], areaCodes)
    return sortedCodes
  }
}
