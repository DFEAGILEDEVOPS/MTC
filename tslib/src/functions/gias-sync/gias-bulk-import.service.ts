// POC code to dump extract into a staging table

import * as sql from 'mssql'
import { ConnectionPoolService } from '../../sql/sql.service'

export class GiasBulkImport {
  async importExtract (extract: Array<any>): Promise<any> {
    const pool = await ConnectionPoolService.getInstance()
    const table = new sql.Table('mtc_admin.giasStaging')
    table.create = false
    table.columns.add('leaCode', sql.Int)
    // @ts-ignore
    table.columns.add('estabCode', sql.Int)
    table.columns.add('urn', sql.Int, { nullable: false })
    table.columns.add('dfeNumber', sql.Int, { nullable: false })
    // @ts-ignore
    table.columns.add('name', sql.NVarChar, { length: 'max', nullable: false })
    for (let index = 0; index < extract.length; index++) {
      const entry = extract[index]
      const estabNumber = typeof entry.EstablishmentNumber === 'number' ? entry.EstablishmentNumber : 'nil-'
      const dfeNumber = `${entry.LA.Code}${estabNumber}`
      table.rows.add(entry.LA.Code, estabNumber, entry.URN, dfeNumber, entry.EstablishmentName)
    }
    const request = new sql.Request(pool)
    await request.bulk(table)
  }
}
