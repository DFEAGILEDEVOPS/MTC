import { type TypeOfEstablishmentData, TypeOfEstablishmentDataService } from './type-of-establishment.data.service'
import * as sortService from '../../helpers/table-sorting'

export class TypeOfEstablishmentService {
  public static async getEstablishmentDataSortedByName (): Promise<TypeOfEstablishmentData[]> {
    const data = await TypeOfEstablishmentDataService.sqlGetEstablishmentData()
    const sorted = sortService.sortByProps(['name'], data)
    return sorted
  }
}
