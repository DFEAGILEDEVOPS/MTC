// POC code to dump extract into a staging table

import * as sql from 'mssql'
import { ConnectionPoolService } from '../../sql/sql.service'

export class GiasBulkImport {
  async importExtract (extract: any): Promise<any> {
    const pool = await ConnectionPoolService.getInstance()
    const table = new sql.Table('mtc_admin.giasStaging')
    table.create = false
    table.columns.add('leaCode', sql.Int)
    table.columns.add('estabCode', sql.NVarChar)
    table.columns.add('urn', sql.Int, { nullable: false })
    table.columns.add('dfeNumber', sql.Int, { nullable: false })
    table.columns.add('name', sql.NVarChar, { nullable: false })
    for (let index = 0; index < extract.length; index++) {
      const entry = extract[index]
      table.rows.add(entry.leaCode, entry.estabCode, entry.urn, entry.dfeNumber, entry.name)
    }
    const request = new sql.Request(pool)
    await request.bulk(table)
  }
}
