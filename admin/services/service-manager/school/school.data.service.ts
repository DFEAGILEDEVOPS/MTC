import sqlService, { TYPES } from '../../../services/data-access/sql.service'
import * as R from 'ramda'

export interface ServiceManagerSchoolResult {
  id: number
  leaCode: number
  estabCode: number
  name: string
  urlSlug: string
  urn: number
  dfeNumber: number
}

export class ServiceManagerSchoolDataService {
  static async sqlFindSchoolByUrn (urn: number): Promise<ServiceManagerSchoolResult> {
    const sql = `
      SELECT
        id,
        leaCode,
        estabCode,
        name,
        urlSlug,
        urn,
        dfeNumber
      FROM
        [mtc_admin].[school]
      WHERE
        urn = @urn
    `

    const params = [{
      name: 'urn',
      value: urn,
      type: TYPES.Int
    }]

    const data = await sqlService.readonlyQuery(sql, params)
    if (data.length === 0) {
      throw new Error(`School not found for URN [${urn}]`)
    }

    const record: any = R.head(data)
    return {
      id: record.id,
      leaCode: record.leaCode,
      estabCode: record.estabCode,
      name: record.name,
      urlSlug: record.urlSlug,
      urn: record.urn,
      dfeNumber: record.dfeNumber
    }
  }

  static async sqlFindSchoolBySlug (slug: string): Promise<ServiceManagerSchoolResult> {
    const sql = `
      SELECT
        id,
        leaCode,
        estabCode,
        name,
        urlSlug,
        urn,
        dfeNumber
      FROM
        [mtc_admin].[school]
      WHERE
        urlSlug = @slug
    `

    const params = [{
      name: 'slug',
      value: slug,
      type: TYPES.UniqueIdentifier
    }]

    const data = await sqlService.readonlyQuery(sql, params)
    if (data.length === 0) {
      throw new Error(`School not found for url slug [${slug}]`)
    }

    const record: any = R.head(data)
    return {
      id: record.id,
      leaCode: record.leaCode,
      estabCode: record.estabCode,
      name: record.name,
      urlSlug: record.urlSlug,
      urn: record.urn,
      dfeNumber: record.dfeNumber
    }
  }
}
