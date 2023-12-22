import { ServiceMessageAreaCodeDataService } from './service-message.data.service'
const sort = require('../../helpers/table-sorting')

export interface IAreaCode {
  code: string
  description: string
}

export interface IBorderColourCode extends IAreaCode {}

export class ServiceMessageCodesService {
  public static async getAreaCodes (): Promise<IAreaCode[]> {
    const areaCodes = await ServiceMessageAreaCodeDataService.sqlGetAreaCodes()
    const sortedCodes = sort.sortByProps(['description'], areaCodes)
    return sortedCodes
  }

  public static async getBorderColourCodes (): Promise<IBorderColourCode[]> {
    const borderColourCodes = await ServiceMessageAreaCodeDataService.sqlGetBorderColourCodes()
    const sortedCodes = sort.sortByProps(['description'], borderColourCodes)
    return sortedCodes
  }
}
