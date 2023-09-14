const sqlService = require('../data-access/sql.service')

export interface TypeOfEstablishmentData {
  code: number
  name: string
}

export class TypeOfEstablishmentDataService {
  public static async sqlGetEstablishmentData (): Promise<TypeOfEstablishmentData[]> {
    const sql = `
      SELECT
        code,
        name
      FROM
        [mtc_admin].[typeOfEstablishmentLookup]
    `
    const data = sqlService.query(sql)
    return data
  }
}
