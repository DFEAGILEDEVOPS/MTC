import { type IAreaCode } from './service-message.service'
const sqlService = require('../data-access/sql.service')

// statics can't be declared in interfaces, so this doesn't work.  See: https://github.com/microsoft/TypeScript/issues/14600
// export interface IServiceMessageAreaCodeDataService {
//   static sqlGetAreaCodes():Promise<IAreaCode[]>
// }

export class ServiceMessageAreaCodeDataService {
  public static async sqlGetAreaCodes (): Promise<IAreaCode[]> {
    const sql = `
      SELECT
        code,
        description
      FROM
        [mtc_admin].[serviceMessageAreaLookup]
    `
    const data = await sqlService.query(sql)
    const areaCodes = data.map((r: any) => { return { code: r.code, description: r.description } })
    return areaCodes
  }

  public static async sqlGetBorderColourCodes (): Promise<IAreaCode[]> {
    const sql = `
      SELECT
        code,
        description
      FROM
        [mtc_admin].[serviceMessageBorderColourLookup]
    `
    const data = await sqlService.query(sql)
    const borderColourCodes = data.map((r: any) => { return { code: r.code, description: r.description } })
    return borderColourCodes
  }
}
